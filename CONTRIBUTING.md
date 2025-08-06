# Contributing to City Hive

Thank you for your interest in contributing to City Hive! We welcome contributors of all experience levels. Please be respectful and provide constructive feedback.

## About City Hive

City Hive is a **production-ready, mobile-first bee mapping platform** built for the NYC beekeeping community. The application enables real-time tracking of bee activity, community collaboration, and data collection for research and conservation.

## Opening an Issue
1. Search the existing issues to avoid duplicates.
2. Open a new issue with a clear title and detailed description.
3. Include steps to reproduce bugs or screenshots for new feature requests when possible.
4. For feature requests, consider how it benefits the beekeeping community and research goals.

## Forking and Making a Pull Request
1. Fork this repository to your GitHub account.
2. Create a new branch for your changes: `git checkout -b feature/your-feature-name`
3. Make your edits, keeping the code modular and well-commented.
4. Test your changes thoroughly, especially on mobile devices.
5. Push the branch to your fork and open a pull request targeting `main`.
6. Describe your changes in the PR and link to any related issues.

## Coding Style Guidelines
- Use modern JavaScript (ES6+) and keep functions small and focused.
- Comment your code where necessary to explain the intent.
- Write descriptive commit messages following conventional commits.
- Follow the existing code structure and patterns.
- Ensure mobile-first responsive design for all UI changes.

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Running the App Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/nyc_feral_bee.git
cd nyc_feral_bee

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to test your changes.

### Testing on Mobile
- Use browser dev tools to simulate mobile devices
- Test on actual mobile devices when possible
- Ensure touch interactions work properly
- Verify GPS and camera functionality

## Project Structure

Key files to understand:
- `src/main.js` - Application entry point and state management
- `src/map.js` - Map functionality and marker management
- `src/supabase.js` - Database operations and authentication
- `src/markerform.js` - Form handling and photo uploads
- `src/auth.js` - Authentication modal and user management

## Database Schema

The application uses Supabase with these main tables:
- `markers` - Bee sighting data with user ownership
- `comments` - Community comments on markers
- `profiles` - User profile information

## Areas for Contribution

### High Priority
- Map filters and search functionality
- Data export tools for research
- Enhanced photo management
- Swarm alert zones for beekeepers

### Medium Priority
- Advanced data collection fields
- Research dashboard features
- Community knowledge base
- Event integration

### Documentation
- Code documentation improvements
- User guides and tutorials
- API documentation
- Research methodology guides

## Code Review Process

1. All PRs require review before merging
2. Ensure code follows project conventions
3. Test functionality on both desktop and mobile
4. Verify authentication and permissions work correctly
5. Check that real-time updates function properly

## Questions?

If you have questions about contributing or the project, please:
1. Check the existing documentation
2. Search existing issues
3. Open a new issue with your question

We appreciate every suggestion and patch, large or small. Happy coding!

---

**Built with 🐝 for the New York Bee Club**
