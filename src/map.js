import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export function createMap() {
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return

  // Remove any placeholder text
  mapContainer.textContent = ''

  const map = new maplibregl.Map({
    container: mapContainer,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [-74.006, 40.7128],
    zoom: 11
  })

  return map
}
