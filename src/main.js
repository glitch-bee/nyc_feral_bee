import './style.css';
import './map.css';
import './pages.css';
import './auth.css';
import './pwa.css'; // PWA-specific styles for install prompts and offline indicators

import favicon from '/cityhive.png';

import {
  onAuthStateChange,
  getUserProfile,
  getAllMarkers,
} from './supabase.js';
import { initNavigation } from './navigation.js';
import { loadMarkers, initMap, setMap, cleanupMap } from './map.js';
import { initWelcomePopup } from './welcome.js';
import { createMarkerForm } from './markerform.js';
import { toast } from './toast.js';
import { MapLayerControls } from './map-controls.js';
import './crosshair.js'; // Import crosshair functionality

// --- Global Application State ---
export const appState = {
  currentUser: null,
  userProfile: null,
  map: null,
  mapControls: null,
};

// --- Application Initialization ---
async function main() {
  // Set favicon programmatically to ensure correct path
  const faviconLink = document.querySelector('link[rel="icon"]');
  if (faviconLink) {
    faviconLink.href = favicon;
  }

  // Test database connection
  try {
    console.log('Testing database connection...');
    const testMarkers = await getAllMarkers();
    console.log('Database connection successful, found markers:', testMarkers);
  } catch (error) {
    console.error('Database connection failed:', error);
    toast.error(
      'Database connection failed. Some features may not work.',
      5000
    );
  }

  // Initialize navigation early
  initNavigation(appState);

  // Get marker form handlers
  const { handleMapClick, setMap: setMarkerFormMap } = createMarkerForm();

  // Initialize the map and wire up the click handler
  const mapInstance = initMap('map', handleMapClick);
  setMap(mapInstance);
  setMarkerFormMap(mapInstance);
  appState.map = mapInstance;

  // Initialize enhanced features
  if (mapInstance) {
    // Wait for map to be fully loaded
    mapInstance.on('load', () => {
      console.log('Map loaded, initializing controls and loading markers');

      // Load initial markers
      loadMarkers();

      // Initialize map layer controls
      appState.mapControls = new MapLayerControls(mapInstance);

      // Show success message
      setTimeout(() => {
        toast.success(
          'Map loaded successfully! Use the layer controls to customize your view.',
          3000
        );
      }, 500);
    });

    // Form enhancements removed for cleaner UI

    // Set up event listeners for enhanced features
    setupEnhancedEventListeners();
  }

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
      loadMarkers();
    }
  });

  // Show the welcome popup on the user's first visit
  if (!localStorage.getItem('visited')) {
    initWelcomePopup();
    localStorage.setItem('visited', 'true');
  }

  // Add cleanup on page unload to prevent memory leaks
  window.addEventListener('beforeunload', () => {
    console.log('Page unloading, cleaning up resources...');
    cleanupMap();
  });

  // Also cleanup on visibility change (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Page hidden, performing light cleanup...');
      // Don't fully cleanup on visibility change, just close popups
      if (appState.map) {
        // Close any open popups to prevent memory leaks
        const popups = document.querySelectorAll('.maplibregl-popup');
        popups.forEach((popup) => {
          const closeBtn = popup.querySelector(
            '.maplibregl-popup-close-button'
          );
          if (closeBtn) closeBtn.click();
        });
      }
    }
  });
}

// --- Enhanced Event Listeners ---
function setupEnhancedEventListeners() {
  // Map controls event listeners
  document.addEventListener('markerVisibilityChanged', (e) => {
    updateMarkerVisibility(e.detail);
  });

  document.addEventListener('quickAction', (e) => {
    handleQuickAction(e.detail.action);
  });

  // Basic form submission feedback
  const form = document.getElementById('markerForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div> Adding...';
        submitBtn.disabled = true;

        // Reset after timeout (form will handle success/error)
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 10000);
      }
    });
  }
}

function updateMarkerVisibility(layers) {
  console.log('updateMarkerVisibility called with:', layers);
  // This would integrate with your existing marker management
  // For now, just show a toast
  toast.info('Marker visibility updated', 2000);
}

function handleQuickAction(action) {
  switch (action) {
    case 'locate':
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (appState.map) {
              appState.map.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 16,
                duration: 1500,
              });
              toast.success('Location found!', 2000);
            }
          },
          () => {
            toast.error('Could not get your location', 3000);
          }
        );
      }
      break;
    case 'fitBounds':
      // This would fit to all markers
      toast.info('Showing all markers', 2000);
      break;
    case 'refresh':
      if (appState.map) {
        loadMarkers();
        toast.success('Markers refreshed', 2000);
      }
      break;
  }
}

// --- Global Error Handlers ---
// Handle uncaught AbortErrors from MapLibre GL JS
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'AbortError') {
    console.debug(
      'Uncaught AbortError (normal MapLibre behavior):',
      event.reason.message
    );
    event.preventDefault(); // Prevent the error from being logged as unhandled
    return;
  }
  // Let other errors bubble up normally
});

// --- Run the Application ---
main().catch((error) => {
  console.error('Application failed to start:', error);
  toast.error('Failed to load the application. Please refresh the page.', 0);
});
