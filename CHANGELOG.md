# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
