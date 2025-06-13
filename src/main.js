import './style.css'
import { createMap, addMarkerToMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'

console.log('main.js loaded')

let map
let currentMarkers = []
let formHelpers

// Helper to clear and re-add markers
function updateMapMarkers(map, markers) {
  // Remove all existing markers (if you keep references, otherwise skip)
  // For now, just re-create the map markers
  // (Ideally, you should keep track of marker objects and remove them, but for demo, just re-add)
  markers.forEach((m) => addMarkerToMap(map, m))
}

async function fetchAndDisplayMarkers() {
  console.log('fetchAndDisplayMarkers called')
  try {
    const { data, error } = await supabase.from('markers').select('*')
    if (error) {
      console.error('Error fetching markers:', error)
      return
    }
    const markers = data || []
    console.log('Fetched markers:', markers)
    if (JSON.stringify(markers) === JSON.stringify(currentMarkers)) return
    currentMarkers = markers
    if (!map) {
      console.log('Creating map...')
      map = createMap('map', markers, formHelpers?.handleMapClick)
      console.log('Map created:', map)
      if (formHelpers) formHelpers.setMap(map)
    } else {
      // Just update markers
      updateMapMarkers(map, markers)
    }
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
    if (!map) {
      console.log('Creating fallback map...')
      map = createMap('map', [], formHelpers?.handleMapClick)
      console.log('Fallback map created:', map)
      if (formHelpers) formHelpers.setMap(map)
    }
  }
}

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...')
  
  // Initialize form first
  formHelpers = createMarkerForm()
  console.log('Form helpers created:', formHelpers)
  
  // Try to create map immediately as fallback
  if (!map) {
    console.log('Creating immediate fallback map...')
    map = createMap('map', [], formHelpers?.handleMapClick)
    if (formHelpers && map) formHelpers.setMap(map)
  }
  
  // Then fetch markers
  await fetchAndDisplayMarkers()
  console.log('Initial markers fetched')
  setInterval(fetchAndDisplayMarkers, 10000)
})


