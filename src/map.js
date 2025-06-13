import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'

console.log('map.js loaded, maplibregl:', maplibregl)

// Store marker references for management
let markerInstances = new Map()

export function addMarkerToMap(map, { id, lat, lng, type, notes }) {
  if (!map) return

  // Remove existing marker if it exists
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
  }

  const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
    `<strong>${type}</strong><p>${notes}</p><small>ID: ${id}</small><br><button onclick="window.deleteMarker('${id}')" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Delete</button>`
  )
  
  const marker = new maplibregl.Marker({
    color: getMarkerColor(type)
  })
    .setLngLat([lng, lat])
    .setPopup(popup)
    .addTo(map)

  // Store marker reference
  markerInstances.set(id, marker)
  
  return marker
}

export function removeMarkerFromMap(id) {
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
    markerInstances.delete(id)
  }
}

export function clearAllMarkers() {
  markerInstances.forEach(marker => marker.remove())
  markerInstances.clear()
}

function getMarkerColor(type) {
  const colors = {
    'Hive': '#ffaa00',
    'Swarm': '#ff6600', 
    'Structure': '#666666',
    'Tree': '#00aa00'
  }
  return colors[type] || '#333333'
}

export function createMap(containerId = 'map', onMapClick) {
  console.log('createMap called with containerId:', containerId)
  const mapContainer = document.getElementById(containerId)
  console.log('mapContainer found:', mapContainer)
  if (!mapContainer) {
    console.error('Map container not found!')
    return null
  }
  // Remove any placeholder text
  mapContainer.textContent = ''
  // NYC + 5 Boroughs bounds with some cushion
  // Covers: Manhattan, Brooklyn, Queens, Bronx, Staten Island
  // Plus parts of NJ, Westchester, and Long Island for context
  const nycBounds = [
    [-74.5, 40.4], // Southwest corner (longitude, latitude)
    [-73.4, 41.0]  // Northeast corner (longitude, latitude)
  ]

  try {
    const map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=mbriicWDtoa7yG1tmDK0',
      center: [-73.935242, 40.730610], // Manhattan center
      zoom: 11,
      minZoom: 9,  // Prevent zooming out too far
      maxZoom: 18, // Prevent zooming in beyond street level
      maxBounds: nycBounds // Restrict panning to NYC area
    })

    console.log('MapLibre map object created:', map)

    map.on('load', () => {
      console.log('Map loaded successfully!')
    })

    map.on('error', (e) => {
      console.error('Map error:', e)
    })

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      })
    }

    return map
  } catch (error) {
    console.error('Error creating map:', error)
    return null
  }
}

/* CSS in JS - This is usually not recommended, but for the sake of the example, we're doing it */
// const style = document.createElement('style')
// style.textContent = `
// #map {
//   position: absolute;
//   top: 0; left: 0; right: 0; bottom: 0;
//   width: 100vw;
//   height: 100vh;
//   z-index: 0;
//   border: 3px solid red !important;
//   background: #222 !important;
// }
// `
// document.head.append(style)

