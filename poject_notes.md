# CityHive2 – Open Urban Bee Sighting Map

## **Project Overview**

**CityHive2** is a modern, open-source mapping app for beekeepers, citizen scientists, and the NY Bee Club community.  
Its core purpose:  
- To allow anyone to add, edit, and view hive, swarm, and related bee sightings on a live-updating map of the city.
- All sightings are **synced instantly and stored in the cloud** (Supabase).
- The map will also support long-term data analysis and visualization for research and conservation.

**Key Features:**
- Interactive web map, mobile-friendly
- Users can add markers for: Hive, Swarm, Structure, or Tree
- Each marker: location, type, notes, optional photo, and timestamp
- All data is real-time synced across all users/devices via Supabase
- Easy export/import for further data analysis (CSV/JSON)
- (Planned) Trend visualization, admin/moderation, and privacy controls

---

## **What’s Done So Far**

- [x] **Project vision and requirements written out**
- [x] **Supabase project created**
    - `markers` table set up (columns: id, lat, lng, type, notes, photo_url, timestamp, user_id)
    - Public storage bucket for photos planned
- [x] **GitHub repository created:** [cityhive2](https://github.com/glitch-bee/cityhive2)
- [x] **Folder structure set up locally**
    - Vite initialized as the frontend framework
    - `/src` for all JS and CSS code
    - `/public` for static assets (logos, etc.)
    - `package.json` and `index.html` at root
- [x] **Vite dev server runs (“Hello Vite!” page displays)**
- [x] **Supabase JS client installed and project connected (to be tested)**

---

## **Immediate Next Steps**

### **Project Setup & Clean Up**
- [ ] Delete default Vite demo files you don’t need (`counter.js`, demo HTML)
- [ ] Replace root `index.html` and `/src/main.js` content with your own markup and JS

### **Supabase Integration**
- [ ] In `/src/supabase.js`, add your Supabase URL and anon key
- [ ] In `/src/main.js`, test fetching and inserting markers with the Supabase client (see examples above)
- [ ] Enable Realtime on the Supabase `markers` table and add a “full access” RLS policy for dev

### **Mapping Integration**
- [ ] Install MapLibre GL JS or Leaflet:
    - `npm install maplibre-gl`
    - or `npm install leaflet`
- [ ] Set up a basic map centered on your city
- [ ] Fetch markers from Supabase and display them as map markers

### **Basic UI**
- [ ] Build a simple form to add markers (location, type, notes)
- [ ] On submit, save marker to Supabase and show it live on the map

---

## **Outline for Future Work**

- Marker editing and deletion
- User-friendly filtering (by type, date)
- Photo upload support using Supabase Storage
- Export/import of markers for analysis
- Responsive/mobile UI polish
- Basic help/instructions modal
- Admin tools and moderation
- Data visualization for trends and year-over-year comparison
- (If needed) Migration to React Native/Expo for a full mobile app

---

## **Project Mission Statement**

CityHive2 is an open, community-driven mapping tool for urban bee tracking and research.  
Our goal: **empower anyone in NYC (and beyond) to record, share, and visualize honey bee sightings and habitat data for science, stewardship, and public engagement.**

---

*Last updated: 2025-06-09*


