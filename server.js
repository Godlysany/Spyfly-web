// SpyFly Unified Server - Handles both static files and API endpoints
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = 5000;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
}

// Database connection
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
});

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

// API request handler
async function handleApiRequest(req, res, pathname, method) {
    try {
        // Test endpoint
        if (pathname === '/api/test' && method === 'GET') {
            const result = await pool.query('SELECT NOW()');
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'connected', time: result.rows[0].now }));
            return;
        }

        // Get all competitions
        if (pathname === '/api/competitions' && method === 'GET') {
            const result = await pool.query(`
                SELECT c.*, 
                       COALESCE(json_agg(
                           CASE WHEN pb.place IS NOT NULL THEN
                               json_build_object('place', pb.place, 'amount_usd', pb.amount_usd, 'percent', pb.percent, 'is_split', pb.is_split)
                           END
                       ) FILTER (WHERE pb.place IS NOT NULL), '[]'::json) as breakdown
                FROM competitions c
                LEFT JOIN prize_breakdown pb ON c.id = pb.competition_id
                GROUP BY c.id
                ORDER BY c.start_date DESC
            `);
            res.writeHead(200);
            res.end(JSON.stringify(result.rows));
            return;
        }

        // Create new competition
        if (pathname === '/api/competitions' && method === 'POST') {
            const body = await getRequestBody(req);
            const comp = JSON.parse(body);
            
            const result = await pool.query(`
                INSERT INTO competitions (name, title, period, start_date, end_date, prize_pool_usd, highlight_copy, cta_text, cta_link)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `, [comp.name, comp.title, comp.period, comp.start_date, comp.end_date, comp.prize_pool_usd, comp.highlight_copy, comp.cta_text, comp.cta_link]);
            
            res.writeHead(201);
            res.end(JSON.stringify({ success: true, id: result.rows[0].id }));
            return;
        }

        // Add winner
        if (pathname === '/api/winners' && method === 'POST') {
            const body = await getRequestBody(req);
            const winner = JSON.parse(body);
            
            await pool.query(`
                INSERT INTO winners (competition_id, place, username, amount_usd, tx_url, paid_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [winner.competition_id, winner.place, winner.username, winner.amount_usd, winner.tx_url || null]);
            
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get system stats
        if (pathname === '/api/stats' && method === 'GET') {
            const distributedResult = await pool.query('SELECT COALESCE(SUM(amount_usd), 0) as total FROM winners');
            const winnersResult = await pool.query('SELECT COUNT(*) as count FROM winners');
            const monthsResult = await pool.query('SELECT COUNT(DISTINCT CONCAT(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at))) as count FROM competitions');
            const cacheResult = await pool.query("SELECT value FROM app_settings WHERE key = 'cache_version'");
            
            res.writeHead(200);
            res.end(JSON.stringify({
                total_distributed: parseInt(distributedResult.rows[0].total),
                total_winners: parseInt(winnersResult.rows[0].count),
                months_active: parseInt(monthsResult.rows[0].count),
                cache_version: cacheResult.rows[0]?.value || '202509'
            }));
            return;
        }

        // Update settings
        if (pathname === '/api/settings' && method === 'PUT') {
            const body = await getRequestBody(req);
            const { key, value } = JSON.parse(body);
            
            await pool.query(`
                INSERT INTO app_settings (key, value) VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
            `, [key, value]);
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get current prize data (for frontend)
        if (pathname === '/api/prizes' && method === 'GET') {
            const now = new Date().toISOString();
            
            // Get current active competition
            const currentResult = await pool.query(`
                SELECT c.*, 
                       COALESCE(json_agg(
                           CASE WHEN pb.place IS NOT NULL THEN
                               json_build_object('place', pb.place, 'amount_usd', pb.amount_usd, 'percent', pb.percent, 'is_split', pb.is_split)
                           END
                       ) FILTER (WHERE pb.place IS NOT NULL), '[]'::json) as breakdown
                FROM competitions c
                LEFT JOIN prize_breakdown pb ON c.id = pb.competition_id
                WHERE c.start_date <= $1 AND c.end_date >= $1
                GROUP BY c.id
                LIMIT 1
            `, [now]);

            // Get upcoming competition
            const upcomingResult = await pool.query(`
                SELECT * FROM competitions 
                WHERE start_date > $1 
                ORDER BY start_date ASC 
                LIMIT 1
            `, [now]);

            // Get historical competitions with winners
            const historyResult = await pool.query(`
                SELECT c.name, c.title, c.period, c.start_date, c.end_date, c.prize_pool_usd,
                       COALESCE(json_agg(
                           CASE WHEN w.place IS NOT NULL THEN
                               json_build_object('place', w.place, 'username', w.username, 'amount_usd', w.amount_usd, 'tx_url', w.tx_url)
                           END
                       ) FILTER (WHERE w.place IS NOT NULL), '[]'::json) as winners
                FROM competitions c
                LEFT JOIN winners w ON c.id = w.competition_id
                WHERE c.end_date < $1
                GROUP BY c.id, c.name, c.title, c.period, c.start_date, c.end_date, c.prize_pool_usd
                ORDER BY c.end_date DESC
                LIMIT 5
            `, [now]);

            // Get app settings
            const settingsResult = await pool.query('SELECT key, value FROM app_settings');
            const settings = {};
            settingsResult.rows.forEach(row => {
                settings[row.key] = row.value;
            });

            // Calculate stats
            const totalDistributed = historyResult.rows.reduce((sum, comp) => {
                return sum + comp.winners.reduce((compSum, winner) => compSum + winner.amount_usd, 0);
            }, 0);

            const totalWinners = historyResult.rows.reduce((sum, comp) => sum + comp.winners.length, 0);

            const response = {
                current: currentResult.rows[0] || null,
                upcoming: upcomingResult.rows[0] || null,
                history: historyResult.rows,
                stats: {
                    total_distributed_usd: totalDistributed,
                    total_winners: totalWinners,
                    months_active: historyResult.rows.length
                },
                config: {
                    hero_promo_days_before_start: parseInt(settings.hero_promo_days_before_start) || 7,
                    cache_version: settings.cache_version || '202509'
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
    
    // Test database connection
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`✅ Database connected at ${result.rows[0].now}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
});

module.exports = server;