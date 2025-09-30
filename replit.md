# SpyFly - Stealthy Solana Alpha Scraper Website

### Overview
SpyFly is a full-stack web application for a fictional bot that scrapes alpha calls from Solana meme caller groups. The website provides a modern, interactive experience with a sleek dark theme, animated elements, a sophisticated leaderboard system, and a production-ready prize management CMS. Its core purpose is to showcase competition data, manage prizes, and display historical performance, targeting the Solana meme coin trading community.

### Recent Changes
**September 30, 2025 - Dynamic Leaderboard Tab + Critical Fixes**
- **Dynamic Active Competition Tab**: Implemented intelligent tab injection system
  - Automatically detects active competitions via `/api/competitions`
  - Dynamically creates and injects tab with competition period/title as first tab
  - Makes active competition tab primary/selected by default
  - Users see their real-time ranking within the active competition immediately
  - Gracefully handles absence of active competition (shows sample data)
  - Other tabs (Weekly, Monthly, All Time) display sample/historical data
- **Critical Admin Fix**: Resolved duplicate `const now` declaration in admin.html (line 769)
  - Admin authentication now works correctly without syntax errors
  - Successfully logs in with admin/admin123 credentials
- **Prize Breakdown Layout**: Enhanced CSS for consistent appearance across STATUS 1 & 2
  - Added flexbox layout with proper spacing and min-height
  - Fixed layout issues between active and completed competition views

**September 30, 2025 - Test Data Population Session**
- **Test Data Populated**: Database now has comprehensive test data for all views
  - 1 active competition (October P&L Championship) with 8 participants
  - 2 completed competitions (September Volume + August Win Rate) with 9 total winners
  - $33,000 total prize pool across all competitions
- **Data Management Tools**: Created `populate-test-data.js` script and `flush-test-data.sql` for easy test data management
- **Cache Control**: Added `Cache-Control: no-cache` headers to `/api/prizes` and `/api/leaderboard` endpoints
- **Documentation**: Created `TEST_DATA_SUMMARY.md` with complete test data inventory and flush instructions
- **Leaderboard Table**: Note that `leaderboard_data` table doesn't exist yet - create it when real API data arrives (SQL provided in `create-leaderboard-table.sql`)

**September 30, 2025 - Earlier Session**
- **Railway Deployment Fix**: Implemented dual authentication support (cookies + Authorization headers) for Railway/production environments
- **Admin Authentication**: Enhanced `verifyAdminToken()` to check Authorization header first, then fallback to cookies
- **Login System**: Updated login flow to store JWT token in localStorage for Railway compatibility where cookies may not persist
- **Leaderboard API**: Created `/api/leaderboard` endpoint with real-time stats calculation from `leaderboard_data` table
- **Dynamic Stats**: Added `loadLeaderboardStats()` function in leaderboard.js to fetch and display live stats

**September 30, 2025 - Previous Session**
- Fixed debug UI buttons to use real API data instead of hardcoded mock data
- Added `/api/cleanup-duplicates` endpoint for database maintenance (removed 45 duplicate winner records)
- Fixed admin authentication: corrected password hash in `migrations.sql` (credentials: admin/admin123)
- Database cleanup: Total distributed prizes now shows realistic $6,400 instead of inflated $57,600
- All status views (1, 2, 3) now display consistent real data with proper Championship History formatting

### User Preferences
- N/A (fresh import, no established preferences)

### System Architecture
The project is a full-stack web application with a Node.js backend and a static HTML/CSS/JavaScript frontend. It uses a Supabase PostgreSQL database for data storage. The application is designed for autoscale deployment and includes a secure admin panel with JWT authentication for prize management.

**UI/UX Decisions:**
- **Theming**: Dark theme with a consistent green color (`#32CD32`) and sophisticated glow effects.
- **Typography**: Uses Orbitron from Google Fonts.
- **Animations**: Features flying fly animation with realistic movement, interactive fly swatter mini-game, image comparison slider, and video backgrounds with WebM/MP4 fallbacks.
- **Responsiveness**: Designed for optimal viewing on both mobile and desktop devices.
- **Interactive Elements**: Includes sound effects, smooth scrolling navigation, and touch/mouse event handling for interactive components.

**Technical Implementations:**
- **Backend**: Node.js server running on port 5000, integrated with Supabase.
- **Frontend**: Pure HTML, CSS, and JavaScript.
- **CMS**: Admin panel for comprehensive competition lifecycle management, including creation, editing, participant viewing, prize distribution, and winner approval workflows across a 5-tab modal system.
- **Leaderboard**: Real-time leaderboard population from the database, displaying actual competition participants with adaptive formatting for scores (P&L, Volume, Win Rate).
- **Prize Management**: Advanced prize distribution system with controlled input UI, live validation against the total prize pool, visual feedback, and auto-calculation presets.
- **Authentication**: JWT-based authentication for secure access to the admin panel (default: admin/admin123).
- **Winner Management**: Status-based approval workflow (pending, approved, disqualified) with features like runner-up auto-promotion.
- **Debug Tools**: Status testing buttons (1, 2, 3) that load real API data filtered by status requirements, plus a cleanup endpoint (`/api/cleanup-duplicates`) for removing duplicate winner records.
- **Data Integrity**: Automatic deduplication ensures winners don't have multiple records for the same competition.

**Feature Specifications:**
- **Competition Lifecycle Management**: A 5-tab modal system for competition details (Overview, Edit, Participants, Prizes, Winners).
- **Prize Distribution System**: Configurable prize breakdown with validation and presets for various splits (e.g., Top 3, Top 5, Equal).
- **Dynamic Leaderboard**: Displays live competition data, handles empty states gracefully, and formats scores based on competition type.
- **Historical Data**: Tracks `created_at` and `updated_at` timestamps for audit trails.
- **Robust Error Handling**: Graceful handling of empty data states and API errors.

### External Dependencies
- **Database**: Supabase (PostgreSQL)
- **Backend Libraries**: Node.js 20, `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`, `pg`
- **Frontend Libraries**: None (Pure HTML/CSS/JS)
- **External Services**: Google Fonts, Font Awesome icons (via CDN)