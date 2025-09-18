// SpyFly Unified Server - Handles both static files and API endpoints
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'spyfly-jwt-secret-change-in-production-2025';
const PORT = process.env.PORT || 5000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

// Supabase client for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// MIME types for static file serving
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript', 
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // Handle API endpoints
        if (pathname.startsWith('/api/')) {
            res.setHeader('Content-Type', 'application/json');
            await handleApiRequest(req, res, pathname, method);
            return;
        }

        // Handle static files
        await handleStaticFile(req, res, pathname);

    } catch (error) {
        console.error('Server Error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

// Authentication helper functions
async function verifyAdminToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', decoded.adminId)
            .eq('is_active', true)
            .single();
            
        if (error || !admin) return null;
        return admin;
    } catch (error) {
        return null;
    }
}

// API request handler
async function handleApiRequest(req, res, pathname, method) {
    try {
        // ===== AUTHENTICATION ENDPOINTS =====
        
        // Admin login
        if (pathname === '/api/admin/login' && method === 'POST') {
            const body = await getRequestBody(req);
            const { username, password } = JSON.parse(body);
            
            if (!username || !password) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Username and password required' }));
                return;
            }
            
            // Get admin user
            const { data: admin, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single();
                
            if (adminError || !admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }
            
            // Check if account is locked
            if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
                res.writeHead(423);
                res.end(JSON.stringify({ error: 'Account temporarily locked due to failed attempts' }));
                return;
            }
            
            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            if (!isValidPassword) {
                // Increment failed attempts
                await supabase
                    .from('admin_users')
                    .update({ 
                        failed_login_attempts: admin.failed_login_attempts + 1,
                        locked_until: admin.failed_login_attempts >= 4 ? 
                            new Date(Date.now() + 15 * 60 * 1000).toISOString() : null // 15 min lock
                    })
                    .eq('id', admin.id);
                    
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }
            
            // Generate JWT
            const token = jwt.sign(
                { adminId: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '8h' }
            );
            
            // Update last login and reset failed attempts
            await supabase
                .from('admin_users')
                .update({ 
                    last_login_at: new Date().toISOString(),
                    failed_login_attempts: 0,
                    locked_until: null
                })
                .eq('id', admin.id);
                
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    created_at: admin.created_at
                }
            }));
            return;
        }

        // Verify admin token
        if (pathname === '/api/admin/verify' && method === 'GET') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Invalid token' }));
                return;
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role
                }
            }));
            return;
        }

        // Change admin password (requires current password)
        if (pathname === '/api/admin/change-password' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { current_password, new_password } = JSON.parse(body);
            
            // Verify current password
            const isCurrentValid = await bcrypt.compare(current_password, admin.password_hash);
            if (!isCurrentValid) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Current password incorrect' }));
                return;
            }
            
            // Hash new password
            const newPasswordHash = await bcrypt.hash(new_password, 12);
            
            // Update password
            const { error } = await supabase
                .from('admin_users')
                .update({ password_hash: newPasswordHash })
                .eq('id', admin.id);
                
            if (error) throw error;
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: 'Password updated successfully' }));
            return;
        }

        // ===== PROTECTED ADMIN ENDPOINTS =====
        
        // Test endpoint
        if (pathname === '/api/test' && method === 'GET') {
            const { data, error } = await supabase.from('competitions').select('count').limit(1);
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'connected', supabase: true, time: new Date() }));
            return;
        }

        // Get all competitions
        if (pathname === '/api/competitions' && method === 'GET') {
            const { data: competitions, error } = await supabase
                .from('competitions')
                .select(`*, prize_breakdown(*)`)
                .order('start_date', { ascending: false });
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify(competitions));
            return;
        }

        // Create new competition (PROTECTED)
        if (pathname === '/api/competitions' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const comp = JSON.parse(body);
            
            // Extract prize breakdown if provided
            const prizeBreakdown = comp.prize_breakdown;
            delete comp.prize_breakdown; // Remove from competition object
            
            const { data, error } = await supabase
                .from('competitions')
                .insert([comp])
                .select();
            
            if (error) throw error;
            
            // Add prize breakdown if provided
            if (prizeBreakdown && prizeBreakdown.length > 0) {
                const breakdownInserts = prizeBreakdown.map(breakdown => ({
                    competition_id: data[0].id,
                    ...breakdown
                }));
                
                const { error: breakdownError } = await supabase
                    .from('prize_breakdown')
                    .insert(breakdownInserts);
                    
                if (breakdownError) {
                    console.error('Prize breakdown insert error:', breakdownError);
                }
            }
            
            res.writeHead(201);
            res.end(JSON.stringify({ success: true, id: data[0].id }));
            return;
        }

        // Get all winners (PROTECTED)  
        if (pathname === '/api/winners' && method === 'GET') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const { data: winners, error } = await supabase
                .from('winners')
                .select(`*, competitions(title)`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Flatten competition title
            const winnersWithTitle = winners.map(winner => ({
                ...winner,
                competition_title: winner.competitions?.title
            }));
            
            res.writeHead(200);
            res.end(JSON.stringify(winnersWithTitle));
            return;
        }

        // Add winner (PROTECTED)
        if (pathname === '/api/winners' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const winner = JSON.parse(body);
            
            const { error } = await supabase
                .from('winners')
                .insert([{ ...winner, paid_at: new Date().toISOString() }]);
            
            if (error) throw error;
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Update winner (PROTECTED)
        if (pathname.startsWith('/api/winners/') && method === 'PUT') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const winnerId = pathname.split('/api/winners/')[1];
            const body = await getRequestBody(req);
            const updates = JSON.parse(body);
            
            const { error } = await supabase
                .from('winners')
                .update(updates)
                .eq('id', winnerId);
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Delete winner (PROTECTED)
        if (pathname.startsWith('/api/winners/') && method === 'DELETE') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const winnerId = pathname.split('/api/winners/')[1];
            
            const { error } = await supabase
                .from('winners')
                .delete()
                .eq('id', winnerId);
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get system stats
        if (pathname === '/api/stats' && method === 'GET') {
            const [
                { data: winners },
                { data: competitions },
                { data: settings }
            ] = await Promise.all([
                supabase.from('winners').select('amount_usd'),
                supabase.from('competitions').select('id, created_at'),
                supabase.from('app_settings').select('*').eq('key', 'cache_version')
            ]);
            
            const totalDistributed = winners?.reduce((sum, w) => sum + w.amount_usd, 0) || 0;
            const totalWinners = winners?.length || 0;
            const monthsActive = competitions?.length || 0;
            const cacheVersion = settings?.[0]?.value || '202509';
            
            res.writeHead(200);
            res.end(JSON.stringify({
                total_distributed: totalDistributed,
                total_winners: totalWinners,
                months_active: monthsActive,
                cache_version: cacheVersion
            }));
            return;
        }

        // Update settings (PROTECTED)
        if (pathname === '/api/settings' && method === 'PUT') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { key, value } = JSON.parse(body);
            
            const { error } = await supabase
                .from('app_settings')
                .upsert([{ key, value, updated_at: new Date().toISOString() }]);
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get current prize data (for frontend)
        if (pathname === '/api/prizes' && method === 'GET') {
            const now = new Date().toISOString();
            
            // Get current active competition
            const { data: currentComp } = await supabase
                .from('competitions')
                .select(`*, prize_breakdown(*)`)
                .lte('start_date', now)
                .gte('end_date', now)
                .limit(1)
                .single();

            // Get upcoming competitions (multiple to show variety)
            const { data: upcomingComps } = await supabase
                .from('competitions')
                .select('*')
                .gt('start_date', now)
                .order('start_date', { ascending: true })
                .limit(3);

            // Get historical competitions with winners
            const { data: historyComps } = await supabase
                .from('competitions')
                .select(`*, winners(*)`)
                .lt('end_date', now)
                .order('end_date', { ascending: false })
                .limit(5);

            // Get settings
            const { data: settings } = await supabase
                .from('app_settings')
                .select('*');

            const settingsMap = {};
            settings?.forEach(s => settingsMap[s.key] = s.value);

            // Calculate stats from history
            const totalDistributed = historyComps?.reduce((sum, comp) => {
                return sum + (comp.winners?.reduce((compSum, winner) => compSum + winner.amount_usd, 0) || 0);
            }, 0) || 0;

            const totalWinners = historyComps?.reduce((sum, comp) => sum + (comp.winners?.length || 0), 0) || 0;

            const response = {
                current: currentComp ? [currentComp] : [],
                upcoming: upcomingComps || [],  
                history: historyComps || [],
                stats: {
                    total_distributed_usd: totalDistributed,
                    total_winners: totalWinners,
                    months_active: historyComps?.length || 0
                },
                config: {
                    hero_promo_days_before_start: parseInt(settingsMap.hero_promo_days_before_start) || 7,
                    cache_version: settingsMap.cache_version || '202509'
                }
            };

            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
        }

        // 404 for unknown API endpoints
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));

    } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
}

// Static file handler
async function handleStaticFile(req, res, pathname) {
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(500);
            res.end('Server error');
        }
    }
}

// Helper function to get request body
function getRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body));
    });
}

// Start server
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 SpyFly Server running on port ${PORT}`);
    
    // Test Supabase connection
    try {
        const { data, error } = await supabase.from('competitions').select('count').limit(1);
        if (error && !error.message.includes('does not exist')) {
            throw error;
        }
        console.log(`✅ Supabase connected to ${SUPABASE_URL}`);
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
    }
});

module.exports = server;