import './style.css'
import { createMap } from './map.js'
import { createMarkerForm } from './markerform.js'
import { supabase } from './supabase.js'

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  let markers = []

  // Fetch all markers from Supabase
  try {
    const { data, error } = await supabase.from('markers').select('*')
    if (error) {
      console.error('Error fetching markers:', error)
    } else {
      markers = data
      console.log('Fetched markers:', data)
    }
  } catch (err) {
    console.error('Unexpected error fetching markers:', err)
  }

  createMap('map', markers)
  createMarkerForm()
})
