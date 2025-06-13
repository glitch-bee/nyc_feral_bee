import { supabase } from './supabase.js'
import { addMarkerToMap } from './map.js'

export function createMarkerForm() {
  const formContainer = document.getElementById('marker-form')
  if (!formContainer) return {}

  formContainer.innerHTML = `
    <form id="markerForm">
      <label>Marker Type
        <select name="type">
          <option value="Hive">Hive</option>
          <option value="Swarm">Swarm</option>
          <option value="Structure">Structure</option>
          <option value="Tree">Tree</option>
        </select>
      </label>
      <label>Notes
        <textarea name="notes" rows="3"></textarea>
      </label>
      <input type="hidden" name="lat">
      <input type="hidden" name="lng">
      <p id="locationPrompt">Click the map to select location</p>
      <button type="submit">Add Marker</button>
      <div id="formError" class="error"></div>
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
    const lat = parseFloat(latInput.value)
    const lng = parseFloat(lngInput.value)
    if (isNaN(lat) || isNaN(lng)) {
      errorDiv.textContent = 'Please select a location on the map.'
      return
    }
    const marker = { type: typeSelect.value, notes: notesInput.value, lat, lng }
    try {
      const { data, error } = await supabase
        .from('markers')
        .insert(marker)
        .select()
        .single()
      if (error) throw error
      if (mapRef) addMarkerToMap(mapRef, data)
      form.reset()
      latInput.value = ''
      lngInput.value = ''
      locationPrompt.textContent = 'Click the map to select location'
      locationPrompt.classList.remove('picked')
    } catch (err) {
      errorDiv.textContent = err.message || 'Error adding marker'
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
