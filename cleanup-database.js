// Database cleanup script to fix duplicate and incorrect data
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
    console.log('🧹 Starting database cleanup...\n');
    
    try {
        // 1. Delete duplicate November competitions (keep oldest)
        console.log('1️⃣ Removing duplicate November competitions...');
        const { data: novComps } = await supabase
            .from('competitions')
            .select('id, created_at')
            .eq('title', 'November Championship - DRAFT')
            .order('created_at', { ascending: true });
        
        if (novComps && novComps.length > 1) {
            const keepId = novComps[0].id;
            const deleteIds = novComps.slice(1).map(c => c.id);
            for (const id of deleteIds) {
                await supabase.from('competitions').delete().eq('id', id);
            }
            console.log(`   ✅ Deleted ${deleteIds.length} duplicate November competition(s)`);
        } else {
            console.log('   ℹ️  No duplicate November competitions found');
        }
        
        // 2. Delete duplicate prize_breakdown entries
        console.log('\n2️⃣ Removing duplicate prize breakdown entries...');
        const { data: prizes } = await supabase
            .from('prize_breakdown')
            .select('id, competition_id, place, created_at')
            .eq('competition_id', '11111111-1111-1111-1111-111111111111')
            .order('created_at', { ascending: true });
        
        if (prizes) {
            const seen = new Set();
            const toDelete = [];
            for (const prize of prizes) {
                const key = `${prize.competition_id}-${prize.place}`;
                if (seen.has(key)) {
                    toDelete.push(prize.id);
                } else {
                    seen.add(key);
                }
            }
            
            for (const id of toDelete) {
                await supabase.from('prize_breakdown').delete().eq('id', id);
            }
            console.log(`   ✅ Deleted ${toDelete.length} duplicate prize breakdown entries`);
        }
        
        // 3. Delete duplicate participants (keep oldest per user/competition)
        console.log('\n3️⃣ Removing duplicate participants...');
        const { data: allParticipants } = await supabase
            .from('participants')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (allParticipants) {
            const seen = new Map();
            const toDelete = [];
            
            for (const participant of allParticipants) {
                const key = `${participant.competition_id}-${participant.wallet_address}`;
                if (seen.has(key)) {
                    toDelete.push(participant.id);
                } else {
                    seen.set(key, participant.id);
                }
            }
            
            for (const id of toDelete) {
                await supabase.from('participants').delete().eq('id', id);
            }
            console.log(`   ✅ Deleted ${toDelete.length} duplicate participants`);
        }
        
        // 4. Fix incorrect winner prize amounts
        console.log('\n4️⃣ Fixing incorrect winner prize amounts...');
        
        // Get correct prize amounts from prize_breakdown
        const correctPrizes = {
            '33333333-3333-3333-3333-333333333333': { // August Win Rate
                1: 4000,
                2: 2400,
                3: 1600
            },
            '22222222-2222-2222-2222-222222222222': { // September Volume
                1: 5000,
                2: 3000,
                3: 2000
            }
        };
        
        let fixedCount = 0;
        for (const [compId, prizes] of Object.entries(correctPrizes)) {
            const { data: winners } = await supabase
                .from('winners')
                .select('*')
                .eq('competition_id', compId);
            
            if (winners) {
                for (const winner of winners) {
                    const correctAmount = prizes[winner.place];
                    if (winner.amount_usd !== correctAmount) {
                        await supabase
                            .from('winners')
                            .update({ amount_usd: correctAmount })
                            .eq('id', winner.id);
                        fixedCount++;
                    }
                }
            }
        }
        console.log(`   ✅ Fixed ${fixedCount} incorrect winner prize amounts`);
        
        // 5. Summary
        console.log('\n📊 Final Database State:');
        const { data: competitions } = await supabase.from('competitions').select('*');
        const { data: participants } = await supabase.from('participants').select('*');
        const { data: winners } = await supabase.from('winners').select('*');
        const { data: prizeBreakdown } = await supabase.from('prize_breakdown').select('*');
        
        console.log(`   Competitions: ${competitions?.length || 0}`);
        console.log(`   Participants: ${participants?.length || 0}`);
        console.log(`   Winners: ${winners?.length || 0}`);
        console.log(`   Prize Breakdowns: ${prizeBreakdown?.length || 0}`);
        
        console.log('\n✅ Database cleanup complete!');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    }
}

cleanup();
