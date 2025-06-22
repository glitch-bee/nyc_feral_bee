import { addMarker, uploadPhoto } from './supabase.js'
import { addMarkerToMap } from './map.js'
import { appState } from './main.js'; // Import global state
import { showAuthModal } from './auth.js'; // Import modal function

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
      <form id="markerForm">        <div class="form-group">
          <label class="form-label" for="typeSelect">Marker Type</label>
          <select name="type" id="typeSelect" class="form-select">
            <option value="Hive">🍯 Hive</option>
            <option value="Swarm">🐝 Swarm</option>
            <option value="Structure">🏢 Structure</option>
            <option value="Tree">🌳 Tree</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="statusSelect">Status</label>
          <select name="status" id="statusSelect" class="form-select">
            <option value="Unverified">⚪ Unverified</option>
            <option value="Active">🟢 Active</option>
            <option value="Checked">🟡 Checked</option>
            <option value="Gone">🔴 Gone</option>
            <option value="Removed">🗑️ Removed</option>
          </select>
        </div>
        
          <div class="form-group">
          <label class="form-label" for="notesInput">Notes</label>
          <textarea name="notes" id="notesInput" class="form-textarea" rows="3" placeholder="Add details about this sighting..."></textarea>
        </div>
          <div class="form-group">
          <label class="form-label" for="photoInput">Photo (optional)</label>
          <input type="file" name="photo" id="photoInput" class="form-file" accept="image/*">
          <div id="photoPreview" class="photo-preview" style="display: none;">
            <img id="previewImage" alt="Photo preview">
            <button type="button" id="removePhoto" class="btn-remove-photo">✕</button>
          </div>
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
  const statusSelect = form.querySelector('select[name="status"]')
  const notesInput = form.querySelector('textarea[name="notes"]')
  const photoInput = form.querySelector('input[name="photo"]')
  const photoPreview = form.querySelector('#photoPreview')
  const previewImage = form.querySelector('#previewImage')
  const removePhotoBtn = form.querySelector('#removePhoto')
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
    
    // --- AUTHENTICATION CHECK ---
    if (!appState.currentUser) {
      errorDiv.textContent = 'You must be logged in to add a marker.';
      errorDiv.style.display = 'block';
      // Briefly show the login modal to prompt the user
      showAuthModal();
      setTimeout(() => {
        if (document.getElementById('auth-modal')) {
           document.getElementById('auth-modal').style.display = 'flex';
        }
      }, 100);
      return;
    }
    
    const lat = parseFloat(latInput.value)
    const lng = parseFloat(lngInput.value)
    if (isNaN(lat) || isNaN(lng)) {
      errorDiv.textContent = 'Please select a location on the map.'
      errorDiv.style.display = 'block'
      return
    }
      const markerData = { 
      type: typeSelect.value, 
      status: statusSelect.value,
      notes: notesInput.value, 
      lat, 
      lng,
      user_id: appState.currentUser.id // Add user ID to marker data
    }
    
    try {
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]')
      const originalBtnText = submitBtn.innerHTML
      submitBtn.innerHTML = '⏳ Adding...'
      submitBtn.disabled = true
      
      // Upload photo if selected
      if (photoInput.files[0]) {
        try {
          const photoResult = await uploadPhoto(photoInput.files[0])
          markerData.photo_url = photoResult.url
        } catch (photoError) {
          console.error('Photo upload failed:', photoError)
          // Continue without photo rather than failing completely
          alert('Photo upload failed, but marker will be added without photo.')
        }
      }
      
      // Use the new addMarker function
      const newMarker = await addMarker(markerData)
      
      if (mapRef) {
        addMarkerToMap(mapRef, newMarker)
      }
      
      form.reset()
      removePhoto() // Clear photo preview
      latInput.value = ''
      lngInput.value = ''
      locationPrompt.textContent = '📍 Click the map to select location'
      locationPrompt.classList.remove('picked')
      
      // Reset button
      submitBtn.innerHTML = originalBtnText
      submitBtn.disabled = false
      
      // Auto-collapse form on mobile after successful submission
      if (window.innerWidth <= 768) {
        formContainer.classList.remove('expanded')
      }
      
      console.log('Marker added successfully:', newMarker)
    } catch (err) {
      // Reset button
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.innerHTML = 'Add Marker'
      submitBtn.disabled = false
      
      errorDiv.textContent = err.message || 'Error adding marker'
      errorDiv.style.display = 'block'
    }
  }
  form.addEventListener('submit', submitForm)
  locateBtn.addEventListener('click', locateUser)
  photoInput.addEventListener('change', handlePhotoSelection)
  removePhotoBtn.addEventListener('click', removePhoto)
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
        console.error('Geolocation error:', error)
        let message = 'Unable to retrieve your location.'
        if (error.code === 1) { // PERMISSION_DENIED
          message = 'Location access denied. Please enable it in your browser settings.'
        }
        alert(message)
        // Reset button
        locateBtn.innerHTML = originalText
        locateBtn.disabled = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }
  
  function handlePhotoSelection() {
    const file = photoInput.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImage.src = e.target.result
        photoPreview.style.display = 'block'
      }
      reader.readAsDataURL(file)
    } else {
      removePhoto()
    }
  }

  function removePhoto() {
    photoInput.value = ''
    previewImage.src = ''
    photoPreview.style.display = 'none'
  }

  return { handleMapClick, setMap, submitForm }
} 