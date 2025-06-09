import './style.css'
import { createMap } from './map.js'
import { createMarkerForm } from './markerform.js'

// Initialize application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  createMap()
  createMarkerForm()
})
