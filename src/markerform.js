import { addMarker } from './supabase.js'
import { addMarkerToMap } from './map.js'

export function createMarkerForm() {
  const formContainer = document.getElementById('marker-form')
  if (!formContainer) return {}

  formContainer.innerHTML = `
    <!-- Mobile form header (only visible on mobile) -->
    <div class="mobile-form-header" onclick="toggleMobileForm()">
      <h3 class="mobile-form-title">Add Bee Sighting</h3>
      <span class="mobile-form-toggle">🔽</span>
    </div>
    
    <!-- Form content -->
    <div class="mobile-form-content">
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
        
        <div class="location-controls">
          <button type="button" id="locateBtn" class="btn btn-locate">
            📍 Locate Me
          </button>
        </div>
        
        <button type="submit" class="btn btn-primary">Add Marker</button>
        <div id="formError" class="error" style="display: none;"></div>
      </form>
    </div>
  `

  // Add mobile toggle functionality to global scope
  window.toggleMobileForm = function() {
    formContainer.classList.toggle('expanded')
  }
  const form = formContainer.querySelector('#markerForm')
  const typeSelect = form.querySelector('select[name="type"]')
  const notesInput = form.querySelector('textarea[name="notes"]')
  const latInput = form.querySelector('input[name="lat"]')
  const lngInput = form.querySelector('input[name="lng"]')
  const locationPrompt = form.querySelector('#locationPrompt')
  const errorDiv = form.querySelector('#formError')
  const locateBtn = form.querySelector('#locateBtn')

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
      
      // Auto-collapse form on mobile after successful submission
      if (window.innerWidth <= 768) {
        formContainer.classList.remove('expanded')
      }
      
      console.log('Marker added successfully:', newMarker)
    } catch (err) {
      errorDiv.textContent = err.message || 'Error adding marker'
      errorDiv.style.display = 'block'
    }
  }

  form.addEventListener('submit', submitForm)
  locateBtn.addEventListener('click', locateUser)
  function handleMapClick({ lng, lat }) {
    lngInput.value = lng
    latInput.value = lat
    locationPrompt.textContent = `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    locationPrompt.classList.add('picked')
    
    // Auto-expand form on mobile when location is selected
    if (window.innerWidth <= 768) {
      formContainer.classList.add('expanded')
    }
  }

  function setMap(m) {
    mapRef = m
  }

  // Geolocation function
  function locateUser() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    // Update button to show loading state
    const originalText = locateBtn.innerHTML
    locateBtn.innerHTML = '🔄 Locating...'
    locateBtn.disabled = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Check if coordinates are within NYC bounds (roughly)
        const nycBounds = {
          north: 41.0,
          south: 40.4,
          east: -73.4,
          west: -74.5
        }
        
        if (latitude >= nycBounds.south && latitude <= nycBounds.north &&
            longitude >= nycBounds.west && longitude <= nycBounds.east) {
          
          // Set the form coordinates
          latInput.value = latitude
          lngInput.value = longitude
          locationPrompt.textContent = `📍 Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          locationPrompt.classList.add('picked')
          
          // Center the map on user's location
          if (mapRef) {
            mapRef.flyTo({
              center: [longitude, latitude],
              zoom: 16, // Zoom in closer for precise placement
              duration: 1500
            })
          }
          
          // Auto-expand form on mobile when location is found
          if (window.innerWidth <= 768) {
            formContainer.classList.add('expanded')
          }
          
        } else {
          alert('Your location appears to be outside of NYC. Please manually select a location on the map.')
          locationPrompt.textContent = '📍 Click the map to select location'
        }
        
        // Reset button
        locateBtn.innerHTML = originalText
        locateBtn.disabled = false
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'The request to get location timed out.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        
        alert(errorMessage + ' Please manually select a location on the map.')
        
        // Reset button
        locateBtn.innerHTML = originalText
        locateBtn.disabled = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache location for 1 minute
      }
    )
  }

  return { handleMapClick, setMap }
}
