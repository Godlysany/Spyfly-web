# SpyFly - Stealthy Solana Alpha Scraper Website

### Overview
SpyFly is a full-stack web application for a fictional bot that scrapes alpha calls from Solana meme caller groups. The website provides a modern, interactive experience with a sleek dark theme, animated elements, a sophisticated leaderboard system, and a production-ready prize management CMS. Its core purpose is to showcase competition data, manage prizes, and display historical performance, targeting the Solana meme coin trading community.

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
- **Authentication**: JWT-based authentication for secure access to the admin panel.
- **Winner Management**: Status-based approval workflow (pending, approved, disqualified) with features like runner-up auto-promotion.

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