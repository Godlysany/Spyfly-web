// Script to populate test data for leaderboard and competitions
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test trader usernames
const traderNames = [
    'crypto_wizard', 'alpha_hunter', 'moon_sniper', 'degen_king', 'fly_whisperer',
    'volume_king', 'whale_hunter', 'precision_pro', 'snipe_master', 'accuracy_ace',
    'legend_trader', 'profit_machine', 'volume_beast', 'whale_slayer', 'perfect_sniper',
    'accuracy_king', 'goat_trader', 'alpha_legend', 'moon_emperor', 'profit_god',
    'volume_titan', 'trade_machine', 'whale_destroyer', 'precision_lord', 'snipe_god'
];

// Generate random data helpers
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => (Math.random() * (max - min) + min).toFixed(decimals);

async function createLeaderboardTable() {
    console.log('📊 Creating leaderboard_data table if not exists...');
    
    // Create the table via raw SQL
    const { error: tableError } = await supabase.rpc('exec_sql', { 
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
        `
    });
    
    if (tableError) {
        console.log('  Note: Cannot create table via RPC, may already exist or need manual creation');
    }
}

async function populateLeaderboardData() {
    console.log('📊 Populating leaderboard_data table...');
    
    // First try to create the table
    await createLeaderboardTable();
    
    const leaderboardEntries = traderNames.map(username => ({
        username,
        pnl: parseFloat(randomFloat(10000, 500000)),
        volume: parseFloat(randomFloat(1000000, 20000000)),
        win_rate: parseFloat(randomFloat(65, 95)),
        trades_today: random(5, 50)
    }));

    const { data, error } = await supabase
        .from('leaderboard_data')
        .insert(leaderboardEntries);

    if (error) {
        console.error('❌ Error inserting leaderboard data:', error);
        console.log('  Skipping leaderboard_data - table may not exist');
    } else {
        console.log(`✅ Inserted ${leaderboardEntries.length} leaderboard entries`);
    }
}

async function populateCompetitionParticipants() {
    console.log('\n👥 Populating competition participants...');
    
    // Get competitions
    const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id, title, competition_type, status')
        .in('status', ['active', 'completed']);

    if (compError) {
        console.error('❌ Error fetching competitions:', compError);
        return;
    }

    for (const comp of competitions) {
        console.log(`\n  Competition: ${comp.title} (${comp.competition_type})`);
        
        // Select 15-20 random traders for each competition
        const participantCount = random(15, 20);
        const selectedTraders = [...traderNames]
            .sort(() => Math.random() - 0.5)
            .slice(0, participantCount);

        const participants = selectedTraders.map((username, idx) => {
            let score;
            if (comp.competition_type === 'P&L') {
                score = parseFloat(randomFloat(5000, 150000));
            } else if (comp.competition_type === 'Volume') {
                score = parseFloat(randomFloat(500000, 5000000));
            } else if (comp.competition_type === 'Win Rate') {
                score = parseFloat(randomFloat(70, 98));
            }

            return {
                competition_id: comp.id,
                wallet_address: `${username.slice(0, 8)}...${Math.random().toString(36).slice(2, 6)}`,
                username,
                score,
                entry_date: new Date(Date.now() - random(1, 30) * 24 * 60 * 60 * 1000).toISOString()
            };
        });

        const { data, error } = await supabase
            .from('participants')
            .insert(participants);

        if (error) {
            console.error(`  ❌ Error inserting participants:`, error);
        } else {
            console.log(`  ✅ Inserted ${participants.length} participants`);
        }

        // For completed competitions, add winners
        if (comp.status === 'completed') {
            const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
            const topWinners = sortedParticipants.slice(0, 3);
            
            const prizeAmounts = [5000, 3000, 2000]; // 1st, 2nd, 3rd place prizes
            
            const winners = topWinners.map((p, idx) => ({
                competition_id: comp.id,
                wallet_address: p.wallet_address,
                username: p.username,
                place: idx + 1,
                amount_usd: prizeAmounts[idx],
                payment_status: 'paid',
                paid_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            }));

            const { data: winData, error: winError } = await supabase
                .from('winners')
                .insert(winners);

            if (winError) {
                console.error(`  ❌ Error inserting winners:`, winError);
            } else {
                console.log(`  🏆 Added ${winners.length} winners`);
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting test data population...\n');
    
    // Clear existing test data
    console.log('🧹 Clearing existing test data...');
    await supabase.from('leaderboard_data').delete().neq('id', 0);
    await supabase.from('participants').delete().neq('id', 0);
    await supabase.from('winners').delete().eq('status', 'approved').lt('amount_usd', 10000); // Only test winners
    console.log('✅ Cleared old test data\n');
    
    await populateLeaderboardData();
    await populateCompetitionParticipants();
    
    console.log('\n✅ Test data population complete!');
    console.log('\n📝 To flush test data later, run:');
    console.log('   DELETE FROM leaderboard_data;');
    console.log('   DELETE FROM participants;');
    console.log('   DELETE FROM winners WHERE status = \'approved\';');
}

main().catch(console.error);
