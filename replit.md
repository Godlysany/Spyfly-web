# SpyFly - Stealthy Solana Alpha Scraper Website

## Overview
A modern, interactive single-page website for SpyFly, a fictional bot that scrapes alpha calls from Solana meme caller groups. The website features a sleek dark theme with animated elements and interactive games.

## Current State
- **Status**: ✅ Fully functional and deployed
- **Environment**: Replit with Python 3.11
- **Server**: Python HTTP server on port 5000
- **Deployment**: Configured for autoscale deployment

## Project Architecture
- **Type**: Static HTML/CSS/JavaScript website
- **Server**: Python's built-in HTTP server (`python3 -m http.server`)
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
├── index.html          # Main HTML structure
├── styles.css          # CSS styling (1135 lines)
├── script.js           # JavaScript functionality (547 lines)
├── favicon.png         # Site favicon
├── logo.png           # Logo image
├── images/            # Background images and videos
├── fly/               # Fly game assets (fly.png, smack.png, squash.png)
├── gallery/           # Photo/video gallery assets
├── sound/             # Audio files (buzz.mp3, swosh.mp3)
├── docs/              # Additional test files
└── vercel.json        # Original Vercel deployment config
```

## Recent Changes (Sept 17, 2025)
- ✅ Installed Python 3.11 for serving static files
- ✅ Configured workflow to serve website on port 5000 with proper host binding
- ✅ Set up deployment configuration for autoscale deployment
- ✅ Verified all interactive features work correctly (slider, fly animation, sounds)
- ✅ Confirmed all assets load properly (images, videos, audio)

## Technical Details
- Uses Orbitron font from Google Fonts for futuristic styling
- CSS custom properties for theming (primary color: #32CD32)
- JavaScript modules for different functionalities (slider, animation, sounds)
- HTML5 video with WebM/MP4 fallbacks for cross-browser compatibility
- Touch and mouse event handling for mobile/desktop compatibility

## Dependencies
- Python 3.11 (for HTTP server)
- No package manager dependencies (pure HTML/CSS/JS)
- External: Google Fonts, Font Awesome icons (via CDN)

## User Preferences
- N/A (fresh import, no established preferences)