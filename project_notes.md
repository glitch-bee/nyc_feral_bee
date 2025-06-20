# City Hive – Urban Bee Mapping Platform

## **Project Overview**

**City Hive** is a **production-ready, mobile-first mapping platform** designed for beekeepers, citizen scientists, and bee conservation enthusiasts. It serves as a comprehensive tool for tracking bee activity across urban environments with real-time data sharing and collaboration features.

## **BRANDING NOTES (June 2025)**

**IMPORTANT: Display naming conventions for consistency:**

- **Application name:** Display as "City Hive" (not "CityHive2")
  - Technical URLs and file paths remain `/cityhive2/` for compatibility
  - Only update display text in HTML titles, headings, and content

- **Organization name:** Display as "New York Bee Club" (not "NYC Bee Club")
  - Keep all geographic references as "NYC" (NYC regulations, NYC beekeepers, etc.)
  - Only change organization name references to "New York Bee Club"
  - All links to nybeeclub.org remain unchanged

**Files updated with branding:**
- `public/about.html` - Updated all display references
- `public/resources.html` - Updated all display references
- `README.md` - Updated to "City Hive" branding

---

## **✅ PRODUCTION STATUS - JUNE 2025**

### **🎉 FULLY FUNCTIONAL MOBILE APPLICATION COMPLETED!**

City Hive is now a **complete, production-ready platform** with all core features implemented and tested.

#### **1. Complete Authentication System**

- ✅ **User registration and login** with email/password
- ✅ **User profiles** with display names and admin roles
- ✅ **Secure authentication** via Supabase Auth
- ✅ **Session management** with automatic login persistence
- ✅ **Admin permissions** for content moderation

#### **2. Advanced Mobile-First Experience**

- ✅ **Fully responsive design** optimized for mobile devices
- ✅ **Touch-friendly interface** with modal-based marker details
- ✅ **Instant updates** without page reloads for seamless mobile experience
- ✅ **Mobile-optimized popups** that work perfectly on small screens
- ✅ **GPS integration** for easy location capture in the field
- ✅ **Photo uploads** directly from mobile cameras

#### **3. Complete Marker Management System**

- ✅ **Four marker types** with color-coded identification:
  - 🟡 **Hive** = Orange (`#ffaa00`) - Established bee colonies
  - 🔴 **Swarm** = Red-orange (`#ff6600`) - Mobile bee clusters
  - ⚫ **Structure** = Gray (`#666666`) - Bees in buildings/man-made structures
  - 🟢 **Tree** = Green (`#00aa00`) - Natural tree cavities with bees
- ✅ **Status system** with visual indicators:
  - ⚪ Unverified, 🟢 Active, 🟡 Checked, 🔴 Gone, 🗑️ Removed
- ✅ **User ownership** - Users can manage their own markers
- ✅ **Admin oversight** - Admins can manage all content

#### **4. Advanced Collaboration Features**

- ✅ **Photo upload system** with cloud storage integration
- ✅ **Community comments** on each marker for collaborative observations
- ✅ **Real-time status updates** across all users and devices
- ✅ **Instant data synchronization** without page refreshes
- ✅ **User attribution** for all contributions

#### **5. Production-Ready Architecture**

- ✅ **UUID-based database schema** with proper foreign key relationships
- ✅ **Clean separation of concerns:**
  - `main.js` - Application initialization and global state management
  - `map.js` - Map creation, marker management, mobile optimization
  - `markerform.js` - Form handling, user input validation, photo uploads
  - `supabase.js` - Database operations, authentication, and file storage
  - `auth.js` - Authentication modal and user management
  - `navigation.js` - Site navigation and user interface
  - `welcome.js` - Welcome guide for new users
- ✅ **Mobile-first design patterns** with responsive layouts
- ✅ **Comprehensive error handling** with user-friendly messages
- ✅ **Real-time data sync** across all users and devices
- ✅ **Performance optimization** for mobile networks

### **🔧 Technical Stack (Production)**

- **Frontend:** Vite + Vanilla JavaScript + MapLibre GL JS
- **Map Style:** MapTiler Streets v2 (vector tiles)
- **Database:** Supabase PostgreSQL with UUID primary keys
- **Authentication:** Supabase Auth with user profiles
- **Storage:** Supabase Storage for photo uploads
- **Real-time:** Supabase real-time updates
- **Mobile:** Responsive design optimized for touch interfaces

### **📊 Database Schema (Production)**

```sql
-- Markers table with UUID primary key and user ownership
CREATE TABLE public.markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat real NOT NULL,
  lng real NOT NULL,
  type text NOT NULL,
  notes text NULL,
  photo_url text NULL,
  status text DEFAULT 'Unverified',
  timestamp timestamptz DEFAULT NOW(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Comments table with UUID foreign key
CREATE TABLE public.comments (
  id bigserial PRIMARY KEY,
  marker_id uuid NOT NULL REFERENCES markers(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  author_name varchar(255) DEFAULT 'Anonymous',
  timestamp timestamptz DEFAULT NOW()
);

-- User profiles table for extended user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);
```

### **🎯 Current Capabilities**

City Hive is now a **fully functional mobile application** that enables:

- **Real-time bee tracking** across urban environments
- **Community collaboration** through comments and status updates
- **Photo documentation** of bee sightings and colonies
- **Mobile-first experience** optimized for field use
- **Instant data sync** across all users
- **Professional data collection** for research and conservation
- **User authentication** with secure account management
- **Admin oversight** for content moderation

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
- **User attribution** for research credibility

### **Future Research Features**

- **Tree species correlation** data collection
- **Aggression level indicators** for safety documentation
- **Varroa mite presence tracking** for health monitoring
- **Colony origin tracking** (swarm source, local hive, etc.)
- **Environmental condition logging** (weather, season, location type)
- **Population density mapping** for urban planning

---

## **📈 Development Roadmap**

### **Completed (Production Ready)**
- ✅ Core mapping platform with real-time updates
- ✅ User authentication and profile system
- ✅ Mobile-optimized interface
- ✅ Photo upload and storage system
- ✅ Community comments and collaboration
- ✅ Status tracking and management
- ✅ Admin permissions and oversight
- ✅ GPS integration and location services

### **Next Phase (Planned)**
- 🔄 Map filters and search functionality
- 🔄 Data export tools for research
- 🔄 Enhanced photo management (multiple photos per marker)
- 🔄 Swarm alert zones for beekeepers
- 🔄 Contact information system for removal services

### **Future Enhancements**
- 🔮 Advanced data collection fields
- 🔮 Research institution partnerships
- 🔮 Machine learning for bee identification
- 🔮 Predictive analytics for swarm forecasting
- 🔮 Mobile app development (iOS/Android)

---

#### Last updated: June 16, 2025
