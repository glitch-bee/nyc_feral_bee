import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export function addMarkerToMap(map, { lat, lng, type, notes }) {
  if (!map) return
  const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
    `<strong>${type}</strong><p>${notes}</p>`
  )
  new maplibregl.Marker().setLngLat([lng, lat]).setPopup(popup).addTo(map)
}

export function createMap(containerId = 'map', markers = [], onMapClick) {
  const mapContainer = document.getElementById(containerId)
  if (!mapContainer) return

  // Remove any placeholder text
  mapContainer.textContent = ''

  const map = new maplibregl.Map({
    container: mapContainer,
    style: 'https://api.maptiler.com/maps/3d/style.json?key=mbriicWDtoa7yG1tmDK0',
    center: [-74.006, 40.7128],
    zoom: 11
  })

  // Add markers to the map
  markers.forEach((m) => addMarkerToMap(map, m))

  if (onMapClick) {
    map.on('click', (e) => {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    })
  }

  return map
}
