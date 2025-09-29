-- ============================================
-- SPYFLY STAGING DATABASE SCHEMA
-- Creates all tables for staging environment
-- ============================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitions Table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    competition_type VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    total_prize_pool DECIMAL(12, 2),
    entry_requirements TEXT,
    rules TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prize Breakdown Table
CREATE TABLE IF NOT EXISTS prize_breakdown (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    place INTEGER NOT NULL,
    prize_amount DECIMAL(12, 2) NOT NULL,
    prize_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Winners Table
CREATE TABLE IF NOT EXISTS winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    place INTEGER NOT NULL,
    wallet_address VARCHAR(255),
    username VARCHAR(255),
    amount_usd DECIMAL(12, 2),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255),
    username VARCHAR(255),
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Settings Table (for leaderboard display settings)
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_winners_competition ON winners(competition_id);
CREATE INDEX IF NOT EXISTS idx_prize_breakdown_competition ON prize_breakdown(competition_id);
CREATE INDEX IF NOT EXISTS idx_participants_competition ON participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- Insert default app setting for leaderboard display
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES ('leaderboard_enabled', 'false', 'Controls whether leaderboard section is visible on landing page')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ SpyFly Staging Database Schema Applied!';
    RAISE NOTICE '📊 Tables Created: admin_users, competitions, prize_breakdown, winners, participants, app_settings';
    RAISE NOTICE '🔍 Indexes: Performance indexes added for common queries';
    RAISE NOTICE '⚙️  Default Settings: Leaderboard display toggle initialized';
    RAISE NOTICE '🚀 Staging environment ready for development!';
END $$;
