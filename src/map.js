import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export function createMap(containerId = 'map', markers = []) {
  const mapContainer = document.getElementById(containerId)
  if (!mapContainer) return

  // Remove any placeholder text
  mapContainer.textContent = ''

  const map = new maplibregl.Map({
    container: mapContainer,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [-74.006, 40.7128],
    zoom: 11
  })

  // Add markers to the map
  markers.forEach(({ lat, lng, type, notes }) => {
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
      `<strong>${type}</strong><p>${notes}</p>`
    )
    new maplibregl.Marker()
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map)
  })

  return map
}
