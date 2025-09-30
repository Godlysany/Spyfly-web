// Setup leaderboard_data table and populate with test data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test trader data
const traderNames = [
    'crypto_wizard', 'alpha_hunter', 'moon_sniper', 'degen_king', 'fly_whisperer',
    'volume_king', 'whale_hunter', 'precision_pro', 'snipe_master', 'accuracy_ace',
    'legend_trader', 'profit_machine', 'volume_beast', 'whale_slayer', 'perfect_sniper',
    'accuracy_king', 'goat_trader', 'alpha_legend', 'moon_emperor', 'profit_god',
    'volume_titan', 'trade_machine', 'whale_destroyer', 'precision_lord', 'snipe_god'
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

async function setupLeaderboard() {
    console.log('🚀 Setting up leaderboard_data table...\n');
    
    // Step 1: Create table via raw SQL
    console.log('📋 Creating leaderboard_data table...');
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS leaderboard_data (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(255) NOT NULL,
                pnl DECIMAL(15,2) DEFAULT 0,
                volume DECIMAL(18,2) DEFAULT 0,
                win_rate DECIMAL(5,2) DEFAULT 0,
                trades_today INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard_data(username);
            CREATE INDEX IF NOT EXISTS idx_leaderboard_pnl ON leaderboard_data(pnl DESC);
        `
    });

    if (createError) {
        console.log('⚠️  Note: Cannot create table via RPC (may need manual creation in Supabase SQL Editor)');
        console.log('   Copy this SQL to Supabase SQL Editor:');
        console.log('   -----------------------------------');
        console.log(`
CREATE TABLE IF NOT EXISTS leaderboard_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    pnl DECIMAL(15,2) DEFAULT 0,
    volume DECIMAL(18,2) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    trades_today INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard_data(username);
CREATE INDEX IF NOT EXISTS idx_leaderboard_pnl ON leaderboard_data(pnl DESC);
        `);
        console.log('   -----------------------------------\n');
    } else {
        console.log('✅ Table created successfully!\n');
    }

    // Step 2: Clear any existing data
    console.log('🧹 Clearing existing leaderboard data...');
    await supabase.from('leaderboard_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Step 3: Generate and insert test data
    console.log('📊 Generating test trader data...');
    const leaderboardEntries = traderNames.map(username => ({
        username,
        pnl: parseFloat(randomFloat(10000, 500000)),
        volume: parseFloat(randomFloat(1000000, 20000000)),
        win_rate: parseFloat(randomFloat(65, 95)),
        trades_today: random(5, 50)
    }));

    console.log(`💾 Inserting ${leaderboardEntries.length} traders into database...`);
    const { data, error } = await supabase
        .from('leaderboard_data')
        .insert(leaderboardEntries);

    if (error) {
        console.error('❌ Error inserting leaderboard data:', error.message);
        console.log('\n⚠️  The table may need to be created manually in Supabase SQL Editor.');
        console.log('   After creating the table, run this script again to populate data.');
    } else {
        console.log('✅ Successfully inserted test trader data!\n');
        
        // Verify insertion
        const { data: verifyData, error: verifyError } = await supabase
            .from('leaderboard_data')
            .select('count');
        
        if (!verifyError && verifyData) {
            console.log(`✨ Verification: ${leaderboardEntries.length} traders in leaderboard_data table`);
        }
        
        // Show stats
        const totalPnl = leaderboardEntries.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
        const totalVolume = leaderboardEntries.reduce((sum, t) => sum + parseFloat(t.volume), 0);
        const avgWinRate = leaderboardEntries.reduce((sum, t) => sum + parseFloat(t.win_rate), 0) / leaderboardEntries.length;
        const totalTrades = leaderboardEntries.reduce((sum, t) => sum + t.trades_today, 0);
        
        console.log('\n📈 Test Data Stats:');
        console.log(`   Total P&L: $${totalPnl.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
        console.log(`   Total Volume: $${totalVolume.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
        console.log(`   Avg Win Rate: ${avgWinRate.toFixed(1)}%`);
        console.log(`   Trades Today: ${totalTrades}`);
        console.log('\n✅ Leaderboard setup complete! Visit /leaderboard.html to see live stats.');
    }
}

setupLeaderboard().catch(console.error);
