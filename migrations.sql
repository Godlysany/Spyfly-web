-- ============================================
-- SPYFLY STAGING - FIX SCHEMA & ADD DATA
-- Fix app_settings column names and add test data
-- ============================================

-- ============================================
-- 1. FIX APP_SETTINGS TABLE SCHEMA
-- ============================================

-- Drop the incorrect app_settings table
DROP TABLE IF EXISTS app_settings CASCADE;

-- Recreate with correct column names (key and value, not setting_key and setting_value)
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_app_settings_key ON app_settings(key);

-- Insert default leaderboard setting
INSERT INTO app_settings (key, value)
VALUES ('leaderboard_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. ADMIN USER SETUP
-- ============================================
INSERT INTO admin_users (username, password_hash, is_active)
VALUES ('admin', '$2b$10$z4ao/AGeP5U844fXAji0puNnwRorrrf.2wZacbCV6UYGsIvejT3He', true)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 3. SAMPLE COMPETITIONS - ALL STAGES
-- ============================================

-- DRAFT Competition (future)
INSERT INTO competitions (
    id, title, description, competition_type, start_date, end_date, 
    total_prize_pool, status, created_at
)
VALUES (
    gen_random_uuid(),
    'November Championship - DRAFT',
    'Upcoming competition in planning stage',
    'P&L',
    '2025-11-01 00:00:00+00',
    '2025-11-30 23:59:59+00',
    20000.00,
    'draft',
    NOW()
)
ON CONFLICT DO NOTHING;

-- ACTIVE Competition (current)
INSERT INTO competitions (
    id, title, description, competition_type, start_date, end_date, 
    total_prize_pool, entry_requirements, rules, status, created_at
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'October Trading Championship',
    'Live trading competition - Show your skills!',
    'P&L',
    '2025-10-01 00:00:00+00',
    '2025-10-31 23:59:59+00',
    15000.00,
    'Minimum 5 SOL trading volume',
    '1. Fair trading only\n2. No manipulation\n3. Real P&L tracking',
    'active',
    NOW() - INTERVAL '10 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- Prize breakdown for active competition
INSERT INTO prize_breakdown (competition_id, place, prize_amount, prize_description)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 1, 7500.00, 'First Place - Top Trader'),
    ('11111111-1111-1111-1111-111111111111', 2, 4500.00, 'Second Place - Runner Up'),
    ('11111111-1111-1111-1111-111111111111', 3, 3000.00, 'Third Place - Bronze Medal')
ON CONFLICT DO NOTHING;

-- COMPLETED Competition (with winners)
INSERT INTO competitions (
    id, title, description, competition_type, start_date, end_date, 
    total_prize_pool, status, created_at
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'September Volume Challenge',
    'Completed volume-based competition',
    'Volume',
    '2025-09-01 00:00:00+00',
    '2025-09-30 23:59:59+00',
    10000.00,
    'completed',
    NOW() - INTERVAL '30 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- Prize breakdown for completed competition
INSERT INTO prize_breakdown (competition_id, place, prize_amount, prize_description)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 1, 5000.00, 'Volume King'),
    ('22222222-2222-2222-2222-222222222222', 2, 3000.00, 'Volume Runner-up'),
    ('22222222-2222-2222-2222-222222222222', 3, 2000.00, 'Volume Bronze')
ON CONFLICT DO NOTHING;

-- Winners for completed competition
INSERT INTO winners (
    competition_id, place, wallet_address, username, amount_usd, 
    payment_status, paid_at, created_at
)
VALUES 
    (
        '22222222-2222-2222-2222-222222222222', 
        1, 
        '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
        'SolanaTrader1', 
        5000.00, 
        'paid', 
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        2, 
        'AxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
        'CryptoWhale42', 
        3000.00, 
        'paid',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        3, 
        'BxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
        'DiamondHands', 
        2000.00, 
        'pending',
        NULL,
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT DO NOTHING;

-- ANOTHER COMPLETED Competition (Win Rate)
INSERT INTO competitions (
    id, title, description, competition_type, start_date, end_date, 
    total_prize_pool, status, created_at
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'August Win Rate Championship',
    'Best win rate competition - completed',
    'Win Rate',
    '2025-08-01 00:00:00+00',
    '2025-08-31 23:59:59+00',
    8000.00,
    'completed',
    NOW() - INTERVAL '60 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- Prize breakdown for win rate competition
INSERT INTO prize_breakdown (competition_id, place, prize_amount, prize_description)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 1, 4000.00, 'Perfect Win Rate'),
    ('33333333-3333-3333-3333-333333333333', 2, 2400.00, 'High Accuracy'),
    ('33333333-3333-3333-3333-333333333333', 3, 1600.00, 'Consistent Winner')
ON CONFLICT DO NOTHING;

-- Winners for win rate competition
INSERT INTO winners (
    competition_id, place, wallet_address, username, amount_usd, 
    payment_status, paid_at, created_at
)
VALUES 
    (
        '33333333-3333-3333-3333-333333333333', 
        1, 
        'CxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
        'AccuracyMaster', 
        4000.00, 
        'paid',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '26 days'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        2, 
        'DxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
        'SmartTrader99', 
        2400.00, 
        'paid',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '26 days'
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SAMPLE PARTICIPANTS
-- ============================================
INSERT INTO participants (competition_id, wallet_address, username, entry_date)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'SolanaTrader1', NOW() - INTERVAL '5 days'),
    ('11111111-1111-1111-1111-111111111111', 'AxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'CryptoWhale42', NOW() - INTERVAL '4 days'),
    ('11111111-1111-1111-1111-111111111111', 'BxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'DiamondHands', NOW() - INTERVAL '3 days'),
    ('11111111-1111-1111-1111-111111111111', 'ExQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'NewTrader2025', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE - SUMMARY
-- ============================================
DO $$ 
DECLARE
    admin_count INTEGER;
    comp_count INTEGER;
    winner_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO admin_count FROM admin_users;
    SELECT COUNT(*) INTO comp_count FROM competitions;
    SELECT COUNT(*) INTO winner_count FROM winners;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ STAGING DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 ADMIN LOGIN CREDENTIALS:';
    RAISE NOTICE '   Username: admin';
    RAISE NOTICE '   Password: SpyFly2025!Admin';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATA SUMMARY:';
    RAISE NOTICE '   - Admin Users: %', admin_count;
    RAISE NOTICE '   - Competitions: %', comp_count;
    RAISE NOTICE '   - Winners: %', winner_count;
    RAISE NOTICE '';
    RAISE NOTICE '🏆 COMPETITION STAGES:';
    RAISE NOTICE '   ✏️  DRAFT: November Championship (future)';
    RAISE NOTICE '   ▶️  ACTIVE: October Trading Championship (live)';
    RAISE NOTICE '   ✅ COMPLETED: September Volume + August Win Rate';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FIXED: app_settings table now uses key/value columns';
    RAISE NOTICE '🚀 Ready for CMS testing!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- ADD MOCK PARTICIPANT DATA FOR TESTING
-- ============================================

-- Active Competition (October Trading Championship)
INSERT INTO participants (competition_id, wallet_address, username, score, entry_date)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'TopTrader2024', 15420.50, NOW() - INTERVAL '8 days'),
    ('11111111-1111-1111-1111-111111111111', 'AxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'CryptoKing', 12350.75, NOW() - INTERVAL '7 days'),
    ('11111111-1111-1111-1111-111111111111', 'BxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'DiamondHands', 10890.25, NOW() - INTERVAL '6 days'),
    ('11111111-1111-1111-1111-111111111111', 'CxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'MoonShot', 9150.00, NOW() - INTERVAL '5 days'),
    ('11111111-1111-1111-1111-111111111111', 'DxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'AlphaHunter', 8200.50, NOW() - INTERVAL '4 days'),
    ('11111111-1111-1111-1111-111111111111', 'ExQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'SolanaWhale', 7500.00, NOW() - INTERVAL '3 days'),
    ('11111111-1111-1111-1111-111111111111', 'FxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'ProfitMaster', 6800.25, NOW() - INTERVAL '2 days'),
    ('11111111-1111-1111-1111-111111111111', 'GxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'TradeGenius', 5900.00, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Completed Competition (September Volume Challenge) 
INSERT INTO participants (competition_id, wallet_address, username, score, entry_date)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'VolumeKing', 2500000.00, NOW() - INTERVAL '35 days'),
    ('22222222-2222-2222-2222-222222222222', 'AxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'TradeWarrior', 1850000.00, NOW() - INTERVAL '34 days'),
    ('22222222-2222-2222-2222-222222222222', 'BxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'BigPlayer', 1200000.00, NOW() - INTERVAL '33 days'),
    ('22222222-2222-2222-2222-222222222222', 'HxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'ChartMaster', 950000.00, NOW() - INTERVAL '32 days'),
    ('22222222-2222-2222-2222-222222222222', 'IxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'SpeedTrader', 780000.00, NOW() - INTERVAL '31 days')
ON CONFLICT DO NOTHING;

-- Completed Competition (August Win Rate Championship)
INSERT INTO participants (competition_id, wallet_address, username, score, entry_date)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'CxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'AccuracyPro', 0.92, NOW() - INTERVAL '65 days'),
    ('33333333-3333-3333-3333-333333333333', 'DxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'PrecisionTrader', 0.88, NOW() - INTERVAL '64 days'),
    ('33333333-3333-3333-3333-333333333333', 'JxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'ConsistentWinner', 0.85, NOW() - INTERVAL '63 days'),
    ('33333333-3333-3333-3333-333333333333', 'KxQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'SmartPicks', 0.81, NOW() - INTERVAL '62 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIX: DELETE DUPLICATE NOVEMBER COMPETITIONS
-- ============================================
-- Keep only ONE November competition
DELETE FROM competitions 
WHERE title = 'November Championship - DRAFT' 
AND id NOT IN (
    SELECT MIN(id) FROM competitions WHERE title = 'November Championship - DRAFT'
);
