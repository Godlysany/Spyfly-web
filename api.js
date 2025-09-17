// SpyFly Prize Management API
// Handles all database operations for the admin dashboard

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}

// Simple HTTP server for API endpoints
const http = require('http');
const url = require('url');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
});

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // Test endpoint
        if (path === '/api/test' && method === 'GET') {
            const result = await pool.query('SELECT NOW()');
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'connected', time: result.rows[0].now }));
            return;
        }

        // Get all competitions
        if (path === '/api/competitions' && method === 'GET') {
            const result = await pool.query(`
                SELECT c.*, 
                       json_agg(json_build_object('place', pb.place, 'amount_usd', pb.amount_usd, 'percent', pb.percent, 'is_split', pb.is_split)) as breakdown
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
        if (path === '/api/competitions' && method === 'POST') {
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
        if (path === '/api/winners' && method === 'POST') {
            const body = await getRequestBody(req);
            const winner = JSON.parse(body);
            
            await pool.query(`
                INSERT INTO winners (competition_id, place, username, amount_usd, tx_url, paid_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [winner.competition_id, winner.place, winner.username, winner.amount_usd, winner.tx_url]);
            
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Get system stats
        if (path === '/api/stats' && method === 'GET') {
            const distributedResult = await pool.query('SELECT COALESCE(SUM(amount_usd), 0) as total FROM winners');
            const winnersResult = await pool.query('SELECT COUNT(*) as count FROM winners');
            const monthsResult = await pool.query('SELECT COUNT(DISTINCT EXTRACT(YEAR FROM created_at) || EXTRACT(MONTH FROM created_at)) as count FROM competitions');
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
        if (path === '/api/settings' && method === 'PUT') {
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
        if (path === '/api/prizes' && method === 'GET') {
            const now = new Date().toISOString();
            
            // Get current active competition
            const currentResult = await pool.query(`
                SELECT c.*, 
                       json_agg(json_build_object('place', pb.place, 'amount_usd', pb.amount_usd, 'percent', pb.percent, 'is_split', pb.is_split)) as breakdown
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
                SELECT c.*, 
                       json_agg(json_build_object('place', w.place, 'username', w.username, 'amount_usd', w.amount_usd, 'tx_url', w.tx_url)) as winners
                FROM competitions c
                LEFT JOIN winners w ON c.id = w.competition_id
                WHERE c.end_date < $1
                GROUP BY c.id
                ORDER BY c.end_date DESC
                LIMIT 5
            `, [now]);

            // Get app settings
            const settingsResult = await pool.query('SELECT key, value FROM app_settings');
            const settings = {};
            settingsResult.rows.forEach(row => {
                settings[row.key] = row.value;
            });

            const response = {
                current: currentResult.rows[0] || null,
                upcoming: upcomingResult.rows[0] || null,
                history: historyResult.rows,
                config: {
                    hero_promo_days_before_start: parseInt(settings.hero_promo_days_before_start) || 7,
                    cache_version: settings.cache_version || '202509'
                }
            };

            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
        }

        // 404 for unknown endpoints
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found' }));

    } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
});

// Helper function to get request body
function getRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body));
    });
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 SpyFly Prize API running on port ${PORT}`);
});

module.exports = server;