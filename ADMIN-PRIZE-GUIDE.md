# 🏆 SpyFly Prize Promotion System - Admin Guide

## Overview
Your Prize Promotion System is now fully automated and admin-friendly! You only need to update a single JSON file to manage all promotions across your entire website.

## 📋 Monthly Admin Workflow

### Step 1: Update Prize Data
Edit the file: `data/prizes.json`

### Step 2: Key Changes to Make
1. **Move current prize to history** - Add the completed competition to the `history` array
2. **Update current prize** - Move upcoming to current, adjust dates/amounts
3. **Add new upcoming prize** - Create next month's competition
4. **Update stats** - Increment totals (distributed amount, winner count, months active)
5. **Bump cache version** - Change `config.cache_version` (e.g., "202509" → "202510")

### Step 3: Test & Deploy
- Save the file
- The website automatically updates (no code changes needed!)
- All promotional elements activate/deactivate based on dates

## 🎯 Key Features (Fully Automated)

### Hero Promotion Banner
- **Automatically appears** 7 days before competition starts
- **Live countdown** shows time remaining
- **Converts visitors** to leaderboard page

### Leaderboard Integration  
- **Prize pill** shows current prize pool on main page
- **Prize Hub** displays full competition details
- **Historical winners** build social proof and credibility

### State Management
- **No manual status needed** - system computes active/upcoming/ended from dates
- **Bulletproof logic** - prevents admin errors and timing issues
- **Cache control** - admin controls when updates go live

## 📊 JSON Schema Reference

```json
{
  "current": {
    "id": "month-year",
    "title": "Competition Name", 
    "period": "Display Period",
    "start_date": "YYYY-MM-DDTHH:MM:SSZ",
    "end_date": "YYYY-MM-DDTHH:MM:SSZ", 
    "prize_pool_usd": 15000,
    "breakdown": [
      {"place": 1, "amount_usd": 7500, "percent": 50},
      {"place": 2, "amount_usd": 3750, "percent": 25}
    ],
    "highlight_copy": "🔥 Prize messaging for hero banner",
    "cta_text": "JOIN COMPETITION",
    "cta_link": "leaderboard.html#prize-hub"
  }
}
```

## ⚡ Pro Tips

1. **Use UTC dates** - Prevents timezone confusion
2. **Test dates carefully** - Hero banner shows 7 days before start
3. **Update cache_version** - Forces browser updates immediately  
4. **Keep historical data** - Builds credibility and social proof
5. **Transaction links** - Add winner proof for transparency

## 🚨 Safety Features

- **Automatic state computation** - No manual status fields to break
- **Fallback CTAs** - Safe defaults if links are missing
- **Error handling** - System gracefully handles missing data
- **Mobile optimized** - Works perfectly on all devices

## 🎨 Conversion Optimization Built-In

- **Urgency elements** - Live countdowns and "Ends in" messaging
- **Social proof** - Historical payouts and winner testimonials  
- **Visual hierarchy** - Animated prize amounts and clear CTAs
- **Friction reduction** - One-click path to join competition

---

**Your prize system is now fully operational and ready to drive maximum engagement and volume!** 🚀