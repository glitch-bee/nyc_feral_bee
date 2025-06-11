import './style.css'
import { createMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'

let map
let currentMarkers = []
let formHelpers

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
    if (map) map.remove()
    map = createMap('map', markers, formHelpers.handleMapClick)
    formHelpers.setMap(map)
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
