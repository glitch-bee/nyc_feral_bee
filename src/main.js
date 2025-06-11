import './style.css'
import { createMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  const formHelpers = createMarkerForm()

  try {
    const { data, error } = await supabase.from('markers').select('*')
    const markers = error ? [] : data
    const map = createMap('map', markers, formHelpers.handleMapClick)
    formHelpers.setMap(map)
    if (error) console.error('Error fetching markers:', error)
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
    const map = createMap('map', [], formHelpers.handleMapClick)
    formHelpers.setMap(map)
  }
})
