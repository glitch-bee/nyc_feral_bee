import './style.css'
import { createMap, addMarkerToMap, clearAllMarkers, removeMarkerFromMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { getAllMarkers, deleteMarker } from './supabase.js'
import { createWelcomeGuide } from './welcome.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'

console.log('main.js loaded')

let map
let currentMarkers = []
let formHelpers

// Make map and currentMarkers globally accessible for mobile functions
window.map = null
window.currentMarkers = []

// Global function to delete markers (called from popup buttons)
window.deleteMarker = async (markerId) => {
  try {
    await deleteMarker(markerId)
    removeMarkerFromMap(markerId)
    console.log('Marker deleted successfully:', markerId)
    // Refresh markers from database
    await fetchAndDisplayMarkers()
  } catch (error) {
    console.error('Error deleting marker:', error)
    alert('Error deleting marker: ' + error.message)
  }
}

// Helper to update markers on the map
async function updateMapMarkers(map, markers) {
  // Build a set of current and new marker IDs
  const newMarkerIds = new Set(markers.map(m => m.id));
  const currentMarkerIds = new Set(markerInstances ? Array.from(markerInstances.keys()) : []);

  // Remove markers that no longer exist
  for (const id of currentMarkerIds) {
    if (!newMarkerIds.has(id)) {
      removeMarkerFromMap(id);
    }
  }

  // Add or update markers
  for (const marker of markers) {
    const existingMarker = markerInstances && markerInstances.get(marker.id);
    // If marker doesn't exist, add it
    if (!existingMarker) {
      await addMarkerToMap(map, marker);
    } else {
      // If marker data has changed, update it (remove and re-add)
      // Compare relevant fields
      const prev = existingMarker._markerData;
      if (!prev || prev.lat !== marker.lat || prev.lng !== marker.lng || prev.type !== marker.type || prev.status !== marker.status || prev.notes !== marker.notes || prev.photo_url !== marker.photo_url) {
        // Only remove if popup is not open
        const popup = existingMarker.getPopup && existingMarker.getPopup();
        if (!popup || !popup.isOpen()) {
          removeMarkerFromMap(marker.id);
          await addMarkerToMap(map, marker);
        }
        // If popup is open, skip update to preserve user input
      }
    }
    // Store marker data for future comparison
    if (markerInstances && markerInstances.get(marker.id)) {
      markerInstances.get(marker.id)._markerData = { ...marker };
    }
  }
}

async function fetchAndDisplayMarkers() {
  console.log('fetchAndDisplayMarkers called')
  try {
    const markers = await getAllMarkers()
    console.log('Fetched markers:', markers)
    
    // Only update if markers changed
    if (JSON.stringify(markers) === JSON.stringify(currentMarkers)) {
      console.log('No marker changes detected, skipping update')
      return
    }

    // Store the currently open popup's marker ID if any
    const openPopupMarkerId = openPopup ? 
      Array.from(markerInstances.entries())
        .find(([_, marker]) => marker.getPopup() === openPopup)?.[0] 
      : null

    currentMarkers = markers
    window.currentMarkers = markers // Keep global copy updated
    
    // Update markers on existing map
    if (map) {
      await updateMapMarkers(map, markers)
      
      // If there was an open popup, try to reopen it
      if (openPopupMarkerId) {
        const marker = markerInstances.get(openPopupMarkerId)
        if (marker) {
          marker.togglePopup()
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
  }
}

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...')
  
  // Initialize form first
  formHelpers = createMarkerForm()
  console.log('Form helpers created:', formHelpers)
  
  // Create map once
  if (!map) {
    console.log('Creating map...')
    try {
      map = createMap('map', formHelpers?.handleMapClick)
      window.map = map // Keep global copy updated
      if (formHelpers && map) formHelpers.setMap(map)
    } catch (error) {
      console.error('Error creating map:', error)
    }
  }
  
  // Fetch and display initial markers
  try {
    await fetchAndDisplayMarkers()
    console.log('Initial markers fetched')
  } catch (error) {
    console.error('Error fetching markers:', error)
  }
  
  // Set up periodic refresh with longer interval
  setInterval(fetchAndDisplayMarkers, 30000) // Changed from 10000 to 30000 (30 seconds)

  // Show welcome guide if needed
  const welcomeGuide = createWelcomeGuide()
  if (welcomeGuide.shouldShow()) {
    if (!document.querySelector('.welcome-modal')) {
      console.log('Showing welcome guide modal...')
      welcomeGuide.show()
    } else {
      console.log('Welcome modal already present, not showing again.')
    }
  }
})


