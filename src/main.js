import './style.css'
import { createMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Fetch all markers from Supabase
  try {
    const { data, error } = await supabase.from('markers').select('*')
    if (error) {
      console.error('Error fetching markers:', error)
      createMap('map', [])
    } else {
      console.log('Fetched markers:', data)
      createMap('map', data)
    }
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
    createMap('map', [])
  }

  createMarkerForm()
})
