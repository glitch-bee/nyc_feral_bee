# CityHive2 – Urban Bee Mapping Platform

## **Project Overview**

**CityHive2** is a modern, mobile-first mapping platform designed for beekeepers, citizen scientists, and bee conservation enthusiasts. It serves as a comprehensive tool for tracking bee activity across urban environments with real-time data sharing and collaboration features.

### **Core Purpose & Users**

**For Beekeepers:**
- Monitor swarm activity in their area for capture opportunities
- Track removal sites for cut-out services
- Share hive locations with the community
- Opt-in to receive notifications about nearby swarms or bee-inhabited structures

**For Citizen Scientists:**
- Contribute to feral bee colony research and conservation data
- Document wild hive locations, behavior patterns, and health indicators
- Track bee population trends over time
- Collect data on tree species preferences, aggression levels, varroa presence, and colony origins

**For Community Collaboration:**
- Real-time sharing of bee sightings across all users
- Collective mapping of urban bee populations
- Research data for conservation and urban planning initiatives

### **Key Features:**
- **Mobile-first responsive design** - Optimized for smartphones and field use
- **Real-time data sync** via Supabase cloud database
- **Interactive markers** for Hives, Swarms, Structures, and Trees
- **Comprehensive data collection** including photos, status updates, and detailed notes
- **Community comments system** for collaborative observations
- **Status tracking** (Active, Checked, Gone, Removed, Unverified)
- **Photo documentation** with cloud storage integration

---

## **✅ CURRENT STATUS - JUNE 2025**

### **🎉 PRODUCTION-READY MOBILE APP COMPLETED!**

#### **1. Mobile-First Experience**
- ✅ **Fully responsive design** optimized for mobile devices
- ✅ **Touch-friendly interface** with modal-based marker details
- ✅ **Instant updates** without page reloads for seamless mobile experience
- ✅ **Mobile-optimized popups** that work perfectly on small screens

#### **2. Complete Marker System**
- ✅ **Four marker types** with color-coded identification:
  - 🟡 **Hive** = Orange (`#ffaa00`) - Established bee colonies
  - 🔴 **Swarm** = Red-orange (`#ff6600`) - Mobile bee clusters
  - ⚫ **Structure** = Gray (`#666666`) - Bees in buildings/man-made structures  
  - 🟢 **Tree** = Green (`#00aa00`) - Natural tree cavities with bees
- ✅ **Status system** with visual indicators:
  - ⚪ Unverified, 🟢 Active, 🟡 Checked, 🔴 Gone, 🗑️ Removed
#### **3. Advanced Features**

- ✅ **Photo upload system** with cloud storage integration
- ✅ **Community comments** on each marker for collaborative observations
- ✅ **Real-time status updates** (Active, Checked, Gone, Removed, Unverified)
- ✅ **Mobile-optimized UI** with modal-based marker details
- ✅ **Instant updates** without page reloads for seamless user experience

#### **4. Robust Architecture**

- ✅ **UUID-based database schema** with proper foreign key relationships
- ✅ **Clean separation of concerns:**
  - `map.js` - Map creation, marker management, mobile optimization
  - `markerform.js` - Form handling, user input validation
  - `supabase.js` - Database operations with UUID consistency
  - `main.js` - Application initialization and real-time updates
- ✅ **Mobile-first design patterns** with responsive layouts
- ✅ **Error handling** with proper mobile user feedback
- ✅ **Real-time data sync** across all users and devices

#### **5. Production-Ready Quality**

- ✅ **Comprehensive testing** on mobile devices
- ✅ **Database schema optimization** with UUID consistency
- ✅ **Performance optimized** for mobile networks
- ✅ **Proper error handling** with user-friendly messages
- ✅ **Code documentation** and troubleshooting guides

### **🔧 Technical Stack (Current)**

- **Frontend:** Vite + Vanilla JavaScript + MapLibre GL JS
- **Map Style:** MapTiler Streets v2 (vector tiles)
- **Database:** Supabase PostgreSQL with UUID primary keys
- **Storage:** Supabase Storage for photo uploads
- **Real-time:** Supabase real-time updates
- **Mobile:** Responsive design optimized for touch interfaces

### **📊 Database Schema (Production)**

```sql
-- Markers table with UUID primary key
CREATE TABLE public.markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat real NOT NULL,
  lng real NOT NULL,
  type text NOT NULL,
  notes text NULL,
  photo_url text NULL,
  status text DEFAULT 'Unverified',
  timestamp timestamptz DEFAULT NOW(),
  user_id text NULL
);

-- Comments table with UUID foreign key
CREATE TABLE public.comments (
  id bigserial PRIMARY KEY,
  marker_id uuid NOT NULL REFERENCES markers(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  author_name varchar(255) DEFAULT 'Anonymous',
  timestamp timestamptz DEFAULT NOW()
);
```

### **🎯 Current Capabilities**

CityHive2 is now a **production-ready mobile application** that enables:

- **Real-time bee tracking** across urban environments
- **Community collaboration** through comments and status updates
- **Photo documentation** of bee sightings and colonies
- **Mobile-first experience** optimized for field use
- **Instant data sync** across all users
- **Professional data collection** for research and conservation

---

## **🔬 Research & Conservation Applications**

### **Data Collection Capabilities**

The platform now supports comprehensive data gathering for:

- **Colony location tracking** with GPS precision
- **Temporal behavior patterns** through timestamp data
- **Health indicators** via status updates and comments
- **Visual documentation** through photo uploads
- **Community observations** through collaborative comments
- **Long-term trend analysis** through historical data

### **Future Research Features**

- **Tree species correlation** data collection
- **Aggression level indicators** for safety documentation
- **Varroa mite presence tracking** for health monitoring
- **Colony origin tracking** (swarm source, local hive, etc.)
- **Environmental condition logging** (weather, season, location type)
- **Population density mapping** for urban planning

---

*Last updated: June 14, 2025*


