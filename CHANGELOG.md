# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **PWA Scaffolding**: Complete Progressive Web App infrastructure for future installability
  - Web App Manifest (`public/manifest.json`) with app metadata, icons, and display settings
  - Service Worker placeholder (`public/sw.js`) for offline functionality and caching
  - PWA installer handler (`src/pwa-installer.js`) for custom install prompts
  - PWA-specific styles (`src/pwa.css`) with placeholder styling for install buttons and notifications
  - PWA meta tags in HTML for proper mobile app integration
  - PWA implementation guide (`docs/PWA_IMPLEMENTATION.md`) with detailed setup instructions
- Enhanced HTML with PWA meta tags for mobile web app capabilities
- Apple-specific PWA meta tags for iOS installation support
- Vite configuration comments for future PWA plugin integration
- **Hamburger Navigation Menu**: Complete navigation refactor for enhanced mobile usability
  - Mobile-first hamburger menu replacing desktop panel controls
  - Integrated "Add Sighting" and "Map Layers" buttons within navigation menu
  - Backdrop blur effects and smooth slide-in animations
  - Improved accessibility with proper ARIA labels and keyboard navigation
  - Auto-closing menu on interaction and window resize

### Changed
- Updated `src/main.js` to import PWA styles
- Enhanced CSP headers to support PWA service worker functionality
- **Navigation System Overhaul**: Complete refactor from desktop-centric to mobile-first design
  - Replaced floating panel hints with integrated hamburger menu
  - Navigation now uses right-side slide-out panel on all screen sizes
  - Map controls hidden from default view, accessible through hamburger menu
  - Form panel toggle replaced with hamburger menu integration
  - Enhanced mobile form drawer with bottom-up slide animation
- **Improved Mobile UX**: Better touch targets and interaction patterns
  - Larger touch areas for mobile interactions
  - Improved visual feedback for button presses
  - Enhanced contrast and readability in navigation elements

### Removed
- Floating panel hint system (replaced with hamburger menu)
- Desktop map layer controls visibility (moved to hamburger menu)
- Panel toggle button from default view (integrated into hamburger menu)

### Fixed
- Mobile navigation accessibility and usability issues
- Touch interaction problems on small screen devices
- Menu state management and proper cleanup on navigation

### Technical Notes
- All PWA functionality is scaffolded but not yet active (requires manual implementation)
- Ready for Phase 1 implementation: service worker registration and basic caching
- Supports future features: offline functionality, background sync, push notifications
- Cross-platform compatibility: Chrome, Edge, Firefox, Safari (with limitations)
- Navigation system now fully responsive and touch-optimized

## [1.0.0] - 2025-01-23

### Added
- Comprehensive documentation organization and restructuring
- New `docs/` folder structure with `internal/` and `database/` subdirectories
- Enhanced security with proper environment variable validation
- Updated `.env.example` with placeholder values for secure API key management
- Added comprehensive documentation README explaining folder structure
- Enhanced marker management with improved update logic and refresh interval adjustments
- Added utility functions for better marker access and management
- Enhanced welcome guide modal styles and functionality

### Changed
- **Security**: Removed all hardcoded API keys from source code
- **Documentation**: Moved internal development files to `docs/internal/` (private)
- **Database**: Organized SQL scripts into `docs/database/` folder
- **Environment**: Enhanced environment variable handling with validation
- **Structure**: Cleaned up root directory by removing development artifacts
- Updated marker management system with new exports and popup handling
- Improved marker instance handling and existing marker management
- Updated project notes with branding changes and file references for consistency

### Removed
- Hardcoded Supabase URL and API key fallbacks from `src/supabase.js`
- Hardcoded MapTiler API key fallback from `src/map.js`
- Development files from root directory (`mobile-welcome.md`, `counter.js`)
- Database setup files from root directory (moved to `docs/database/`)
- Internal documentation files from root directory (moved to `docs/internal/`)

### Fixed
- Environment variable validation to prevent silent failures
- API key exposure in `.env.example` file
- Repository structure for better organization and security

## [0.9.0] - 2025-06-16

### Added
- Enhanced marker management system
- Updated project documentation and branding
- Improved welcome guide modal

## [0.8.0] - 2025-06-15

### Added
- Enhanced marker management system
- Updated project documentation and branding
- Improved welcome guide modal

## [0.7.0] - 2025-06-14

### Added
- New features and improvements to the application

### Changed
- Updated various components and functionality

## [0.6.0] - 2025-06-13

### Added
- New features and bug fixes
- Project documentation

### Changed
- Enhanced user interface components

## [0.5.0] - 2025-06-12

### Added
- New features

### Changed
- Updated project components

## [0.4.0] - 2025-06-11

### Added
- Documentation
- New features

### Fixed
- Various issues

## [0.3.0] - 2025-06-10

### Added
- Map functionality
- New features

### Changed
- Updated project structure

## [0.2.0] - 2025-06-09

### Added
- Initial project setup
- Basic functionality
- Core features

For more detailed information about specific changes, please refer to the git commit history.
