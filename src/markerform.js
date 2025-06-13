import { addMarker } from './supabase.js'
import { addMarkerToMap } from './map.js'

export function createMarkerForm() {
  const formContainer = document.getElementById('marker-form')
  if (!formContainer) return {}
  formContainer.innerHTML = `
    <form id="markerForm">
      <div class="form-group">
        <label class="form-label" for="typeSelect">Marker Type</label>
        <select name="type" id="typeSelect" class="form-select">
          <option value="Hive">🍯 Hive</option>
          <option value="Swarm">🐝 Swarm</option>
          <option value="Structure">🏢 Structure</option>
          <option value="Tree">🌳 Tree</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="notesInput">Notes</label>
        <textarea name="notes" id="notesInput" class="form-textarea" rows="3" placeholder="Add details about this sighting..."></textarea>
      </div>
      
      <input type="hidden" name="lat">
      <input type="hidden" name="lng">
      
      <div id="locationPrompt" class="location-prompt">
        📍 Click the map to select location
      </div>
      
      <button type="submit" class="btn btn-primary">Add Marker</button>
      <div id="formError" class="error" style="display: none;"></div>
    </form>
  `

  const form = formContainer.querySelector('#markerForm')
  const typeSelect = form.querySelector('select[name="type"]')
  const notesInput = form.querySelector('textarea[name="notes"]')
  const latInput = form.querySelector('input[name="lat"]')
  const lngInput = form.querySelector('input[name="lng"]')
  const locationPrompt = form.querySelector('#locationPrompt')
  const errorDiv = form.querySelector('#formError')

  let mapRef
  
  async function submitForm(e) {
    e.preventDefault()
    errorDiv.textContent = ''
    errorDiv.style.display = 'none'
    
    const lat = parseFloat(latInput.value)
    const lng = parseFloat(lngInput.value)
    if (isNaN(lat) || isNaN(lng)) {
      errorDiv.textContent = 'Please select a location on the map.'
      errorDiv.style.display = 'block'
      return
    }
    
    const markerData = { 
      type: typeSelect.value, 
      notes: notesInput.value, 
      lat, 
      lng 
    }
    
    try {
      // Use the new addMarker function
      const newMarker = await addMarker(markerData)
      
      if (mapRef) {
        addMarkerToMap(mapRef, newMarker)
      }
      
      form.reset()
      latInput.value = ''
      lngInput.value = ''
      locationPrompt.textContent = '📍 Click the map to select location'
      locationPrompt.classList.remove('picked')
      
      console.log('Marker added successfully:', newMarker)
    } catch (err) {
      errorDiv.textContent = err.message || 'Error adding marker'
      errorDiv.style.display = 'block'
    }
  }

  form.addEventListener('submit', submitForm)

  function handleMapClick({ lng, lat }) {
    lngInput.value = lng
    latInput.value = lat
    locationPrompt.textContent = `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    locationPrompt.classList.add('picked')
  }

  function setMap(m) {
    mapRef = m
  }

  return { handleMapClick, setMap }
}
