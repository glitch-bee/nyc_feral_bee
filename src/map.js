import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css' // Import the CSS file for the map container

console.log('map.js loaded, maplibregl:', maplibregl)

export function addMarkerToMap(map, { lat, lng, type, notes }) {
  if (!map) return
  const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
    `<strong>${type}</strong><p>${notes}</p>`
  )
  new maplibregl.Marker().setLngLat([lng, lat]).setPopup(popup).addTo(map)
}

export function createMap(containerId = 'map', markers = [], onMapClick) {
  console.log('createMap called with containerId:', containerId)
  const mapContainer = document.getElementById(containerId)
  console.log('mapContainer found:', mapContainer)
  if (!mapContainer) return
  // Remove any placeholder text
  mapContainer.textContent = ''

  const map = new maplibregl.Map({
    container: mapContainer,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [-74.006, 40.7128],
    zoom: 11
  })

  console.log('MapLibre map object:', map)

  setTimeout(() => {
    map.resize()
    console.log('MapLibre map resized')
  }, 500)

  // Add markers to the map
  markers.forEach((m) => addMarkerToMap(map, m))

  if (onMapClick) {
    map.on('click', (e) => {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    })
  }

  return map
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

