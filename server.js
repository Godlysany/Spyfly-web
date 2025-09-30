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
    // Extract token from HttpOnly cookie
    const cookies = req.headers.cookie || '';
    const tokenMatch = cookies.match(/admin_token=([^;]+)/);
    
    if (!tokenMatch) {
        return null;
    }
    
    const token = tokenMatch[1];
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
        
        // Auth check endpoint
        if (pathname === '/api/auth/check' && method === 'GET') {
            console.log('🔐 Auth check requested');
            const admin = await verifyAdminToken(req);
            console.log('👤 Admin verified:', admin ? admin.username : 'NOT AUTHENTICATED');
            if (admin) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    authenticated: true, 
                    username: admin.username 
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ authenticated: false }));
            }
            return;
        }

        // Logout endpoint
        if (pathname === '/api/auth/logout' && method === 'POST') {
            res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0');
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

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
            
            // Set cookie with HttpOnly flag for security
            res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    created_at: admin.created_at
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
                .select(`*, prize_breakdown(place, prize_amount)`)
                .order('start_date', { ascending: false });
            
            if (error) throw error;
            
            // Transform data to match frontend expectations
            const transformed = competitions.map(comp => {
                // Convert prize_breakdown array to prize_structure object
                const prizeStructure = {};
                if (comp.prize_breakdown && comp.prize_breakdown.length > 0) {
                    comp.prize_breakdown.forEach(pb => {
                        prizeStructure[pb.place] = pb.prize_amount;
                    });
                }
                
                return {
                    id: comp.id,
                    title: comp.title,
                    description: comp.description,
                    type: comp.competition_type,
                    period: comp.period,
                    start_date: comp.start_date,
                    end_date: comp.end_date,
                    prize_pool: comp.total_prize_pool,
                    entry_requirements: comp.entry_requirements,
                    rules: comp.rules,
                    status: comp.status,
                    prize_structure: prizeStructure,
                    created_at: comp.created_at,
                    updated_at: comp.updated_at,
                    participant_count: comp.participant_count || 0
                };
            });
            
            res.writeHead(200);
            res.end(JSON.stringify(transformed));
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
            const frontendData = JSON.parse(body);
            
            // Transform frontend data to database format
            const dbComp = {
                id: frontendData.id,
                title: frontendData.title,
                description: frontendData.description,
                competition_type: frontendData.type,
                period: frontendData.period,
                start_date: frontendData.start_date,
                end_date: frontendData.end_date,
                total_prize_pool: frontendData.prize_pool,
                entry_requirements: frontendData.entry_requirements,
                rules: frontendData.rules,
                status: frontendData.status || 'draft'
            };
            
            const { data, error } = await supabase
                .from('competitions')
                .insert([dbComp])
                .select();
            
            if (error) throw error;
            
            // Add prize breakdown from prize_structure object
            const prizeStructure = frontendData.prize_structure;
            if (prizeStructure && typeof prizeStructure === 'object') {
                const breakdownInserts = Object.entries(prizeStructure).map(([place, amount]) => ({
                    competition_id: data[0].id,
                    place: parseInt(place),
                    prize_amount: parseFloat(amount)
                }));
                
                if (breakdownInserts.length > 0) {
                    const { error: breakdownError } = await supabase
                        .from('prize_breakdown')
                        .insert(breakdownInserts);
                        
                    if (breakdownError) {
                        console.error('Prize breakdown insert error:', breakdownError);
                    }
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
            
            const url = new URL(req.url, `http://${req.headers.host}`);
            const competitionId = url.searchParams.get('competition_id');
            
            let query = supabase
                .from('winners')
                .select(`*, competitions(title)`)
                .order('created_at', { ascending: false });
            
            if (competitionId) {
                query = query.eq('competition_id', competitionId);
            }
            
            const { data: winners, error } = await query;
            
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

        // Approve winner (PROTECTED)
        if (pathname === '/api/winners/approve' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { competition_id, wallet_address, place } = JSON.parse(body);
            
            const { data: leaderboardData } = await supabase
                .from('leaderboard_data')
                .select('*')
                .eq('competition_id', competition_id)
                .eq('wallet_address', wallet_address)
                .single();
            
            if (!leaderboardData) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Participant not found in leaderboard' }));
                return;
            }
            
            const { data: competition } = await supabase
                .from('competitions')
                .select('prize_structure')
                .eq('id', competition_id)
                .single();
            
            const prizeAmount = competition?.prize_structure?.[place.toString()] || 0;
            
            const { error } = await supabase
                .from('winners')
                .upsert({
                    competition_id,
                    wallet_address,
                    username: leaderboardData.username,
                    place,
                    amount_usd: prizeAmount,
                    payment_status: 'approved',
                    paid_at: new Date().toISOString()
                }, {
                    onConflict: 'competition_id,wallet_address,place'
                });
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Disqualify winner (PROTECTED)
        if (pathname === '/api/winners/disqualify' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { competition_id, wallet_address, place } = JSON.parse(body);
            
            const { error: updateError } = await supabase
                .from('winners')
                .upsert({
                    competition_id,
                    wallet_address,
                    username: '',
                    place,
                    amount_usd: 0,
                    payment_status: 'disqualified',
                    paid_at: null
                }, {
                    onConflict: 'competition_id,wallet_address,place'
                });
            
            if (updateError) throw updateError;
            
            const { data: leaderboard } = await supabase
                .from('leaderboard_data')
                .select('*')
                .eq('competition_id', competition_id)
                .order('rank', { ascending: true });
            
            const nextRunner = leaderboard?.find(p => 
                p.rank > place && 
                p.wallet_address !== wallet_address
            );
            
            if (nextRunner) {
                const { data: competition } = await supabase
                    .from('competitions')
                    .select('prize_structure')
                    .eq('id', competition_id)
                    .single();
                
                const prizeAmount = competition?.prize_structure?.[place.toString()] || 0;
                
                await supabase
                    .from('winners')
                    .upsert({
                        competition_id,
                        wallet_address: nextRunner.wallet_address,
                        username: nextRunner.username,
                        place,
                        amount_usd: prizeAmount,
                        payment_status: 'pending',
                        paid_at: null
                    }, {
                        onConflict: 'competition_id,wallet_address,place'
                    });
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, next_runner: nextRunner?.username }));
            return;
        }

        // Revoke winner approval (PROTECTED)
        if (pathname === '/api/winners/revoke' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { competition_id, wallet_address, place } = JSON.parse(body);
            
            const { error } = await supabase
                .from('winners')
                .update({
                    payment_status: 'pending',
                    paid_at: null
                })
                .eq('competition_id', competition_id)
                .eq('wallet_address', wallet_address)
                .eq('place', place);
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Reinstate winner (PROTECTED)
        if (pathname === '/api/winners/reinstate' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { competition_id, wallet_address, place } = JSON.parse(body);
            
            const { error } = await supabase
                .from('winners')
                .update({
                    payment_status: 'pending',
                    paid_at: null
                })
                .eq('competition_id', competition_id)
                .eq('wallet_address', wallet_address)
                .eq('place', place);
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get user stats (PROTECTED)
        if (pathname === '/api/user-stats' && method === 'GET') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const url = new URL(req.url, `http://${req.headers.host}`);
            const searchTerm = url.searchParams.get('search');
            
            if (!searchTerm) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Search term required' }));
                return;
            }
            
            const { data: leaderboardEntries } = await supabase
                .from('leaderboard_data')
                .select('*')
                .or(`username.ilike.%${searchTerm}%,wallet_address.ilike.%${searchTerm}%`);
            
            const { data: winnerEntries } = await supabase
                .from('winners')
                .select('*')
                .or(`username.ilike.%${searchTerm}%,wallet_address.ilike.%${searchTerm}%`);
            
            const uniqueCompetitions = new Set(leaderboardEntries?.map(e => e.competition_id) || []);
            const totalWinnings = winnerEntries?.reduce((sum, w) => sum + (w.amount_usd || 0), 0) || 0;
            const bestRank = Math.min(...(leaderboardEntries?.map(e => e.rank) || [Infinity]));
            
            res.writeHead(200);
            res.end(JSON.stringify({
                competitions_count: uniqueCompetitions.size,
                total_winnings: totalWinnings,
                best_rank: bestRank === Infinity ? null : bestRank
            }));
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
                supabase.from('app_settings').select('*')
            ]);
            
            const totalDistributed = winners?.reduce((sum, w) => sum + w.amount_usd, 0) || 0;
            const totalWinners = winners?.length || 0;
            const monthsActive = competitions?.length || 0;
            
            const settingsMap = {};
            settings?.forEach(s => settingsMap[s.key] = s.value);
            
            res.writeHead(200);
            res.end(JSON.stringify({
                total_distributed: totalDistributed,
                total_winners: totalWinners,
                months_active: monthsActive,
                cache_version: settingsMap.cache_version || '202509',
                leaderboard_enabled: settingsMap.leaderboard_enabled || 'true'
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
                .upsert([{ key, value, updated_at: new Date().toISOString() }], { 
                    onConflict: 'key',
                    ignoreDuplicates: false 
                });
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get leaderboard toggle status
        if (pathname === '/api/leaderboard-toggle' && method === 'GET') {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'leaderboard_enabled')
                .single();
            
            res.writeHead(200);
            res.end(JSON.stringify({ 
                enabled: data?.value === 'true' || data?.value === true || !data
            }));
            return;
        }

        // Update leaderboard toggle (PROTECTED)
        if (pathname === '/api/leaderboard-toggle' && method === 'PUT') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const body = await getRequestBody(req);
            const { enabled } = JSON.parse(body);
            
            const { error } = await supabase
                .from('app_settings')
                .upsert([{ 
                    key: 'leaderboard_enabled', 
                    value: enabled.toString(),
                    updated_at: new Date().toISOString() 
                }], { 
                    onConflict: 'key' 
                });
            
            if (error) throw error;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Cleanup duplicate winners (ADMIN PROTECTED)
        if (pathname === '/api/cleanup-duplicates' && method === 'POST') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            console.log('🧹 Cleaning up duplicate winner records...');
            
            // Get all winners ordered by creation date
            const { data: winners, error } = await supabase
                .from('winners')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to fetch winners' }));
                return;
            }
            
            // Find duplicates (same competition_id + place + username)
            const seen = new Map();
            const duplicateIds = [];
            
            winners.forEach(winner => {
                const key = `${winner.competition_id}-${winner.place}-${winner.username}`;
                if (seen.has(key)) {
                    duplicateIds.push(winner.id);
                } else {
                    seen.set(key, winner.id);
                }
            });
            
            let deletedCount = 0;
            if (duplicateIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('winners')
                    .delete()
                    .in('id', duplicateIds);
                
                if (deleteError) {
                    console.error('Error deleting duplicates:', deleteError);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to delete duplicates' }));
                    return;
                }
                deletedCount = duplicateIds.length;
            }
            
            console.log(`✅ Removed ${deletedCount} duplicate winner records`);
            res.writeHead(200);
            res.end(JSON.stringify({ 
                success: true, 
                message: `Removed ${deletedCount} duplicate records`,
                deletedCount 
            }));
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
                .maybeSingle();
            
            // Fetch participants for current competition if it exists
            if (currentComp) {
                const { data: currentParticipants } = await supabase
                    .from('participants')
                    .select('*')
                    .eq('competition_id', currentComp.id);
                currentComp.participants = currentParticipants || [];
            }

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

            // Manually fetch participants for each historical competition
            if (historyComps && historyComps.length > 0) {
                for (const comp of historyComps) {
                    const { data: participants, error: partError } = await supabase
                        .from('participants')
                        .select('*')
                        .eq('competition_id', comp.id);
                    if (partError) {
                        console.error(`Error fetching participants for ${comp.id}:`, partError);
                    } else {
                        console.log(`Fetched ${participants?.length || 0} participants for ${comp.title}`);
                    }
                    comp.participants = participants || [];
                }
            }

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
            
            // Calculate total volume and trades from all participants
            const totalVolume = historyComps?.reduce((sum, comp) => {
                const compVolume = comp.participants?.reduce((compSum, p) => compSum + (p.score || 0), 0) || 0;
                return sum + compVolume;
            }, 0) || 0;
            
            const totalTrades = historyComps?.reduce((sum, comp) => {
                return sum + (comp.participants?.length || 0) * 50; // Estimate trades per participant
            }, 0) || 0;

            const response = {
                current: currentComp ? [currentComp] : [],
                upcoming: upcomingComps || [],  
                history: historyComps || [],
                stats: {
                    total_distributed_usd: totalDistributed,
                    total_winners: totalWinners,
                    months_active: historyComps?.length || 0,
                    total_volume: totalVolume,
                    total_trades: totalTrades
                },
                config: {
                    hero_promo_days_before_start: parseInt(settingsMap.hero_promo_days_before_start) || 7,
                    cache_version: settingsMap.cache_version || '202509',
                    leaderboard_enabled: settingsMap.leaderboard_enabled === 'true' || settingsMap.leaderboard_enabled === undefined
                }
            };

            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
        }

        // Update competition (PROTECTED)
        if (pathname.startsWith('/api/competitions/') && method === 'PUT') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const competitionId = pathname.split('/')[3];
            const body = await getRequestBody(req);
            const frontendData = JSON.parse(body);
            
            // Transform frontend data to database format
            const dbUpdate = {
                title: frontendData.title,
                description: frontendData.description,
                competition_type: frontendData.type,
                period: frontendData.period,
                start_date: frontendData.start_date,
                end_date: frontendData.end_date,
                total_prize_pool: frontendData.prize_pool,
                entry_requirements: frontendData.entry_requirements,
                rules: frontendData.rules,
                status: frontendData.status,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('competitions')
                .update(dbUpdate)
                .eq('id', competitionId)
                .select();
                
            if (error) throw error;
            
            if (data.length === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Competition not found' }));
                return;
            }
            
            // Update prize breakdown if provided
            if (frontendData.prize_structure && typeof frontendData.prize_structure === 'object') {
                // Delete existing prize breakdown
                await supabase
                    .from('prize_breakdown')
                    .delete()
                    .eq('competition_id', competitionId);
                
                // Insert new prize breakdown
                const breakdownInserts = Object.entries(frontendData.prize_structure).map(([place, amount]) => ({
                    competition_id: competitionId,
                    place: parseInt(place),
                    prize_amount: parseFloat(amount)
                }));
                
                if (breakdownInserts.length > 0) {
                    await supabase
                        .from('prize_breakdown')
                        .insert(breakdownInserts);
                }
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, competition: data[0] }));
            return;
        }

        // Delete competition (PROTECTED)
        if (pathname.startsWith('/api/competitions/') && method === 'DELETE') {
            const admin = await verifyAdminToken(req);
            if (!admin) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            
            const competitionId = pathname.split('/')[3];
            
            // Delete prize breakdown first (foreign key constraint)
            await supabase
                .from('prize_breakdown')
                .delete()
                .eq('competition_id', competitionId);
            
            // Delete winners
            await supabase
                .from('winners')
                .delete()
                .eq('competition_id', competitionId);
            
            // Delete the competition
            const { data, error } = await supabase
                .from('competitions')
                .delete()
                .eq('id', competitionId)
                .select();
                
            if (error) throw error;
            
            if (data.length === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Competition not found' }));
                return;
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: 'Competition deleted successfully' }));
            return;
        }

        // Get participants/leaderboard for a specific competition
        if (pathname.startsWith('/api/competitions/') && pathname.endsWith('/participants') && method === 'GET') {
            const competitionId = pathname.split('/')[3];
            
            // Get competition info
            const { data: competition, error: compError } = await supabase
                .from('competitions')
                .select(`*, prize_breakdown(*)`)
                .eq('id', competitionId)
                .single();
                
            if (compError || !competition) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Competition not found' }));
                return;
            }
            
            // Get participants/leaderboard for this competition
            const { data: participants, error: participantsError } = await supabase
                .from('participants')
                .select('*')
                .eq('competition_id', competitionId)
                .order('rank', { ascending: true });
                
            if (participantsError) throw participantsError;
            
            const response = {
                competition: competition,
                participants: participants || []
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