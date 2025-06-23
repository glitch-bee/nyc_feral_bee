import './style.css';
import './map.css';
import './pages.css';
import './auth.css';

import favicon from '/public/cityhive.png';

import { onAuthStateChange, getUserProfile } from './supabase.js';
import { initNavigation } from './navigation.js';
import { loadMarkers, initMap, setMap } from './map.js';
import { initWelcomePopup } from './welcome.js';
import { createMarkerForm } from './markerform.js';

// --- Global Application State ---
export const appState = {
  currentUser: null,
  userProfile: null,
  map: null,
};

// --- Application Initialization ---
async function main() {
  // Set favicon programmatically to ensure correct path
  const faviconLink = document.querySelector('link[rel="icon"]');
  if (faviconLink) {
    faviconLink.href = favicon;
  }

  // Initialize navigation and marker form early
  initNavigation(appState);
  createMarkerForm();

  // Initialize the map and store the instance in the state
  const mapInstance = initMap();
  setMap(mapInstance);
  appState.map = mapInstance;

  // Listen for authentication state changes to keep the UI in sync
  onAuthStateChange(async (user) => {
    if (user) {
      appState.currentUser = user;
      appState.userProfile = await getUserProfile();
    } else {
      appState.currentUser = null;
      appState.userProfile = null;
    }

    // Re-initialize navigation to show updated user state (login/logout buttons)
    initNavigation(appState);

    // Reload markers to apply correct ownership permissions on popups
    if (appState.map) {
      loadMarkers(appState);
    }
  });

  // Show the welcome popup on the user's first visit
  if (!localStorage.getItem('visited')) {
    initWelcomePopup();
    localStorage.setItem('visited', 'true');
  }
}

// --- Run the Application ---
main().catch(console.error);
