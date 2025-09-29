# SpyFly - Stealthy Solana Alpha Scraper Website

## Overview
A modern, interactive website for SpyFly, a fictional bot that scrapes alpha calls from Solana meme caller groups. The website features a sleek dark theme, animated elements, sophisticated leaderboard system, and production-ready prize management CMS.

## Current State
- **Status**: ✅ Fully functional with Supabase CMS backend
- **Environment**: Replit with Node.js 20
- **Server**: Node.js server on port 5000 with Supabase integration
- **Deployment**: Configured for autoscale deployment
- **Staging**: Separate Railway environment with GitHub Actions workflow

## Project Architecture
- **Type**: Full-stack web application
- **Backend**: Node.js with Supabase PostgreSQL database
- **Frontend**: Static HTML/CSS/JavaScript
- **CMS**: Secure admin panel with JWT authentication
- **Port**: 5000 (configured for Replit environment)
- **Host**: 0.0.0.0 (allows proxy access through Replit)

## Features
- Image comparison slider with drag/touch support
- Flying fly animation with realistic movement patterns
- Interactive fly swatter mini-game
- Sound effects and controls
- Smooth scrolling navigation
- Responsive design for mobile and desktop
- Video backgrounds with WebM/MP4 fallbacks

## File Structure
```
/
├── index.html          # Main landing page
├── leaderboard.html    # Leaderboard display page
├── login.html          # Admin login page
├── admin.html          # CMS admin panel (restructured)
├── server.js           # Node.js backend server
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── favicon.png         # Site favicon
├── logo.png           # Logo image
├── images/            # Background images and videos
├── fly/               # Fly game assets
├── gallery/           # Photo/video gallery assets
├── sound/             # Audio files
├── migrations.sql     # Database migration script
└── .github/workflows/ # GitHub Actions for staging deployment
```

## Recent Changes (Sept 29, 2025)
### CMS Restructure - Operational Focus
- ✅ **Removed unnecessary tabs**: Data Mapping, standalone Winners, Live Monitor, Overrides
- ✅ **Streamlined to 2 tabs**: Competitions and System Statistics
- ✅ **Competitions tab**: Full-width table view with "Create New" button (opens modal)
- ✅ **Competition detail modal**: Three sub-tabs:
  - Participants: View leaderboard participants
  - Prizes: See prize distribution structure
  - Winners: API-driven winner selection with admin approval workflow
- ✅ **Winner approval workflow**:
  - Winners auto-populated from leaderboard API data with "pending" status
  - Admin must approve each winner before finalization
  - Disqualification capability with automatic runner-up promotion
  - Status tracking: pending → approved (or disqualified)
  - Revoke and reinstate functions for flexibility
- ✅ **System Statistics tab**: Aggregated stats with user participation filtering
- ✅ **Production Leaderboard Control**: Master toggle kept prominent at top
- ✅ **Server endpoints added**:
  - POST /api/winners/approve
  - POST /api/winners/disqualify (with runner-up auto-promotion)
  - POST /api/winners/revoke
  - POST /api/winners/reinstate
  - GET /api/user-stats (with search filtering)

### Previous Updates
- ✅ Fixed image slider animation (clear before/after states)
- ✅ Added consistent glow effects to all section titles
- ✅ Set up staging environment on Railway with GitHub Actions
- ✅ Resolved DATABASE_URL encoding issues (@ symbol requires %40)
- ✅ Applied database schema and sample data with admin credentials (admin/SpyFly2025!Admin)

## Technical Details
- **Backend**: Node.js with Supabase PostgreSQL
- **Authentication**: JWT-based admin authentication
- **Database**: Supabase (development and staging environments)
- **Winner Management**: Status-based approval workflow (pending/approved/disqualified)
- **Font**: Orbitron from Google Fonts
- **Theming**: CSS custom properties (primary: #32CD32)
- **Video**: HTML5 with WebM/MP4 fallbacks
- **Mobile Support**: Touch and mouse event handling

## Dependencies
- **Backend**: Node.js 20, @supabase/supabase-js, bcryptjs, jsonwebtoken, pg
- **Frontend**: Pure HTML/CSS/JS
- **External**: Google Fonts, Font Awesome icons (via CDN)

## User Preferences
- N/A (fresh import, no established preferences)