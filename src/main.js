import './style.css'
import { createMap, addMarkerToMap, clearAllMarkers, removeMarkerFromMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { getAllMarkers, deleteMarker } from './supabase.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'

console.log('main.js loaded')

let map
let currentMarkers = []
let formHelpers

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
function updateMapMarkers(map, markers) {
  // Clear existing markers
  clearAllMarkers()
  
  // Add new markers
  markers.forEach((marker) => {
    addMarkerToMap(map, marker)
  })
}

async function fetchAndDisplayMarkers() {
  console.log('fetchAndDisplayMarkers called')
  try {
    const markers = await getAllMarkers()
    console.log('Fetched markers:', markers)
    
    // Only update if markers changed
    if (JSON.stringify(markers) === JSON.stringify(currentMarkers)) return
    currentMarkers = markers
    
    // Update markers on existing map
    if (map) {
      updateMapMarkers(map, markers)
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
    map = createMap('map', formHelpers?.handleMapClick)
    if (formHelpers && map) formHelpers.setMap(map)
  }
  
  // Fetch and display initial markers
  await fetchAndDisplayMarkers()
  console.log('Initial markers fetched')
  
  // Set up periodic refresh
  setInterval(fetchAndDisplayMarkers, 10000)
})


