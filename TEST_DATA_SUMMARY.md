# Test Data Summary

## Current Test Data in Database

### Competitions
1. **Active**: October Trading Championship (P&L) 
   - 44 participants with scores
   - $15,000 prize pool
   - Prize breakdown: $7,500 / $4,500 / $3,000

2. **Completed**: September Volume Challenge (Volume)
   - 5 winners (paid)
   - $10,000 prize pool distributed

3. **Completed**: August Win Rate Championship (Win Rate)
   - 5 winners (paid)
   - Total $6,400 distributed

### Overall Stats
- **Total Distributed**: $36,400
- **Total Winners**: 11 
- **Active Competitions**: 1
- **Completed Competitions**: 2
- **Total Participants**: 44+

### Leaderboard Data
- **leaderboard_data table**: Does not exist yet
- When created, populate with trader stats (username, pnl, volume, win_rate, trades_today)
- Current leaderboard API returns empty array since table doesn't exist

## How to Flush Test Data

When real API data is ready, run the SQL file to clean up:

```bash
# Using Supabase SQL Editor or psql
psql $DATABASE_URL < flush-test-data.sql
```

Or manually via API/admin panel:
1. Delete all participants: `DELETE FROM participants;`
2. Delete all winners: `DELETE FROM winners;`
3. Delete leaderboard data (if table exists): `DELETE FROM leaderboard_data;`

## Creating leaderboard_data Table

If you need the leaderboard stats to work, create the table:

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
```

Then run `node populate-test-data.js` to fill with sample data.

## Viewing Test Data

- **Admin Panel**: http://localhost:5000/admin.html (login: admin / admin123)
- **Leaderboard**: http://localhost:5000/leaderboard.html
- **API Stats**: http://localhost:5000/api/stats
- **API Prizes**: http://localhost:5000/api/prizes

## Notes

- All test data uses fake trader usernames and scores
- Winners are marked as "paid" with payment_status
- Participants have wallet addresses in format `username...xyz`
- Prize amounts are realistic ($2,000 - $7,500 range)
