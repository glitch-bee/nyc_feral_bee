# CityHive2 - NYC Bee Sighting Map 🐝

A collaborative mapping platform for tracking bee sightings in New York City. Built for beekeepers, researchers, and citizen scientists to document and verify bee activity across the five boroughs.

## Features ✨

- **🗺️ Interactive Map** - Real-time collaborative bee sighting map
- **📍 Location Tracking** - GPS-powered location detection and manual pin placement  
- **💬 Community Comments** - Add comments and observations to any sighting
- **📸 Photo Uploads** - Document sightings with photos
- **🔄 Status System** - Track verification status (Unverified, Active, Checked, Gone, Removed)
- **🎯 NYC-Focused** - Optimized boundaries for the five boroughs
- **📱 Mobile-First** - Responsive design for field use

## Tech Stack 🛠️

- **Frontend:** Vanilla JavaScript + Vite
- **Map:** MapLibre GL JS with MapTiler
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Styling:** Modern CSS with Inter font

## Quick Start 🚀

### Option 1: Use with Default Keys (Demo)
```bash
git clone https://github.com/yourusername/cityhive2.git
cd cityhive2
npm install
npm run dev
```

### Option 2: Use Your Own API Keys (Recommended)
```bash
git clone https://github.com/yourusername/cityhive2.git
cd cityhive2
npm install

# Copy example environment file
cp .env.example .env

# Edit .env with your own API keys:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
# VITE_MAPTILER_KEY=your_maptiler_api_key

npm run dev
```

## Setting Up Your Own Instance 🔧

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - `database_setup_comments.sql` - Comments system
   - `database_setup_photos.sql` - Photo storage
   - `database_setup_status.sql` - Status tracking
3. Get your project URL and anon key from Settings > API

### 2. MapTiler Setup  
1. Sign up at [maptiler.com](https://maptiler.com)
2. Get your API key from the dashboard
3. Free tier includes 100,000 map loads/month

### 3. Environment Configuration
Create a `.env` file with your keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPTILER_KEY=your_maptiler_api_key
```

## Deployment 🌐

### GitHub Pages
```bash
npm run build
npm run deploy
```

### Other Platforms
```bash
npm run build
# Upload dist/ folder to your hosting platform
```

## Development 👩‍💻

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview
```

## Project Structure 📁

```
src/
├── main.js          # Application entry point
├── supabase.js      # Database functions
├── map.js           # Map and marker logic
├── markerform.js    # Form handling
├── style.css        # Main styles
└── map.css          # Map-specific styles

public/
└── cityhive-logo.svg # Logo file

*.sql               # Database setup scripts
```

## Contributing 🤝

This project is focused on the NYC bee community. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 📄

MIT License - see LICENSE file for details

## Contact 📧

For questions about the NYC bee community or this project, please open an issue.

---

**Made with 🐝 for NYC beekeepers and citizen scientists**
