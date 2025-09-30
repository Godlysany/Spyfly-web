// Fix remaining database issues
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixIssues() {
    console.log('🔧 Fixing remaining database issues...\n');
    
    try {
        // 1. Clean up ALL duplicate prize_breakdown entries across all competitions
        console.log('1️⃣ Cleaning ALL duplicate prize breakdown entries...');
        const { data: allPrizes } = await supabase
            .from('prize_breakdown')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (allPrizes) {
            const seen = new Map();
            const toDelete = [];
            
            for (const prize of allPrizes) {
                const key = `${prize.competition_id}-${prize.place}`;
                if (seen.has(key)) {
                    toDelete.push(prize.id);
                } else {
                    seen.set(key, prize.id);
                }
            }
            
            for (const id of toDelete) {
                await supabase.from('prize_breakdown').delete().eq('id', id);
            }
            console.log(`   ✅ Deleted ${toDelete.length} duplicate prize breakdowns`);
        }
        
        // 2. Add participants with scores to October competition
        console.log('\n2️⃣ Adding scored participants to October competition...');
        const octoberParticipants = [
            { wallet: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', username: 'SolanaTrader1', score: 15420.50 },
            { wallet: 'AxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', username: 'CryptoWhale42', score: 12350.75 },
            { wallet: 'BxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', username: 'DiamondHands', score: 10890.25 },
            { wallet: 'ExQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', username: 'NewTrader2025', score: 9150.00 }
        ];
        
        const octId = '11111111-1111-1111-1111-111111111111';
        
        // Update existing participants with scores
        for (const p of octoberParticipants) {
            const { data: existing } = await supabase
                .from('participants')
                .select('*')
                .eq('competition_id', octId)
                .eq('wallet_address', p.wallet)
                .single();
            
            if (existing) {
                await supabase
                    .from('participants')
                    .update({ score: p.score })
                    .eq('id', existing.id);
            }
        }
        console.log('   ✅ Updated participants with scores');
        
        // 3. Summary
        console.log('\n📊 Verification:');
        const { data: prizes } = await supabase.from('prize_breakdown').select('*');
        const { data: participants } = await supabase
            .from('participants')
            .select('*')
            .eq('competition_id', octId);
        
        console.log(`   Prize Breakdowns: ${prizes?.length || 0}`);
        console.log(`   October Participants: ${participants?.length || 0}`);
        console.log(`   Participants with scores: ${participants?.filter(p => p.score > 0).length || 0}`);
        
        console.log('\n✅ All issues fixed!');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        process.exit(1);
    }
}

fixIssues();
