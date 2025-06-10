# CityHive2

CityHive2 is a modern mapping tool for beekeepers and citizen scientists to record and share feral honey bee hives and related sightings. Built for the New York Bee Club and open to the public, it lets anyone add, edit, and view hive locations on a real-time map.

[//]: # (TODO: add screenshot)

## Key Features
- **Interactive map** powered by MapLibre GL JS
- **Marker types** for hives, swarms, structures, and trees
- **Real-time sync** via Supabase so everyone sees updates instantly
- **Import/Export** your sightings for further analysis (CSV/JSON)
- Works with modern browsers and mobile devices

## Quick Start for Developers
```bash
# Clone the repo
git clone <repo-url>
cd cityhive2

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open `http://localhost:5173` in your browser to see the app.

## How It Works
CityHive2 uses **Vite** for fast development and bundling, **MapLibre GL JS** for the interactive map, and **Supabase** for real-time data storage and authentication. Markers are stored in Supabase and synced to the map as soon as they are added or edited.

## Contributing
Contributions are very welcome! Please open an issue or pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Project Status and Roadmap
CityHive2 currently loads a map, displays markers from Supabase, and provides a placeholder form for adding new sightings. Upcoming work includes marker editing, photo uploads, moderation tools, and data export features.

## Credits
Created and maintained by **Usher Gay** (<pres.qns@nybeeclub.org>).

## License
MIT
