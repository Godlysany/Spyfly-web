# Leaderboard Setup Instructions

## Quick Setup (2 steps)

### Step 1: Create the Table in Supabase

1. Open your Supabase Dashboard: https://lqvnoyatbxxdbhhlymla.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click "New Query"
4. Copy and paste this SQL:

```sql
CREATE TABLE leaderboard_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    pnl DECIMAL(15,2) DEFAULT 0,
    volume DECIMAL(18,2) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    trades_today INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_username ON leaderboard_data(username);
CREATE INDEX idx_leaderboard_pnl ON leaderboard_data(pnl DESC);
```

5. Click "Run" to execute

### Step 2: Populate with Test Data

Run this command in your terminal (or use the API via admin panel):

```bash
curl -X POST http://localhost:5000/api/admin/setup-leaderboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**OR** use this Node.js script:

```bash
node setup-leaderboard.js
```

## Verify Setup

1. Check leaderboard stats:
   ```bash
   curl http://localhost:5000/api/leaderboard
   ```

2. Visit leaderboard page:
   ```
   http://localhost:5000/leaderboard.html
   ```

You should see 25 traders with live stats (P&L, volume, win rate, trades today).

## Flushing Test Data Later

When ready for real API data:

```sql
DELETE FROM leaderboard_data;
```

Then insert your real trader data from the API.
