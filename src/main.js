import './style.css'
import { createMap, addMarkerToMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'

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
  try {
    const { data, error } = await supabase.from('markers').select('*')
    if (error) {
      console.error('Error fetching markers:', error)
      return
    }
    const markers = data || []
    if (JSON.stringify(markers) === JSON.stringify(currentMarkers)) return
    currentMarkers = markers
    if (!map) {
      map = createMap('map', markers, formHelpers.handleMapClick)
      formHelpers.setMap(map)
    } else {
      // Just update markers
      updateMapMarkers(map, markers)
    }
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
    if (!map) {
      map = createMap('map', [], formHelpers.handleMapClick)
      formHelpers.setMap(map)
    }
  }
}

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  formHelpers = createMarkerForm()
  await fetchAndDisplayMarkers()
  setInterval(fetchAndDisplayMarkers, 10000)
})


