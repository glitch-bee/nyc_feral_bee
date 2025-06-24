import { addMarker, uploadPhoto } from './supabase.js';
import { addMarkerToMap } from './map.js';
import { appState } from './main.js'; // Import global state
import { showAuthModal } from './auth.js'; // Import modal function

export function createMarkerForm() {
  const formContainer = document.getElementById('marker-form');
  if (!formContainer) return {};

  // Initialize desktop panel state based on user preference or default to collapsed
  if (window.innerWidth > 768) {
    const userPreference = localStorage.getItem('panelCollapsed');
    const shouldCollapse =
      userPreference === null ? true : userPreference === 'true';

    if (shouldCollapse) {
      formContainer.classList.add('panel-collapsed');
    } else {
      formContainer.classList.remove('panel-collapsed');
    }

    // Create floating hint button
    createFloatingHint();

    // Update toggle button state if it exists
    setTimeout(() => {
      const toggleBtn = document.querySelector('.panel-toggle-btn');
      if (toggleBtn) {
        const isCollapsed = formContainer.classList.contains('panel-collapsed');
        toggleBtn.innerHTML = isCollapsed ? '📍 Add Sighting' : '✕ Close Panel';
        toggleBtn.setAttribute('aria-expanded', !isCollapsed);
      }
      updateFloatingHint();
    }, 100);
  }

  // Create floating hint button
  function createFloatingHint() {
    let hintBtn = document.getElementById('panel-hint');
    if (!hintBtn) {
      hintBtn = document.createElement('button');
      hintBtn.id = 'panel-hint';
      hintBtn.className = 'panel-hint';
      hintBtn.innerHTML = 'Add';
      hintBtn.setAttribute('aria-label', 'Open marker form panel');

      hintBtn.addEventListener('click', () => {
        formContainer.classList.remove('panel-collapsed');
        const toggleBtn = document.querySelector('.panel-toggle-btn');
        if (toggleBtn) {
          toggleBtn.innerHTML = '✕ Close Panel';
          toggleBtn.setAttribute('aria-expanded', 'true');
        }
        localStorage.setItem('panelCollapsed', 'false');
        updateFloatingHint();
      });

      document.body.appendChild(hintBtn);
    }
  }

  // Update floating hint visibility
  function updateFloatingHint() {
    const hintBtn = document.getElementById('panel-hint');
    if (hintBtn && window.innerWidth > 768) {
      const isCollapsed = formContainer.classList.contains('panel-collapsed');
      if (isCollapsed) {
        hintBtn.classList.add('show');
      } else {
        hintBtn.classList.remove('show');
      }
    }
  }

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
  `;
  // Add mobile toggle functionality to global scope
  window.toggleMobileForm = function () {
    formContainer.classList.toggle('expanded');
  };
  const form = formContainer.querySelector('#markerForm');
  const typeSelect = form.querySelector('select[name="type"]');
  const statusSelect = form.querySelector('select[name="status"]');
  const notesInput = form.querySelector('textarea[name="notes"]');
  const photoInput = form.querySelector('input[name="photo"]');
  const photoPreview = form.querySelector('#photoPreview');
  const previewImage = form.querySelector('#previewImage');
  const removePhotoBtn = form.querySelector('#removePhoto');
  const latInput = form.querySelector('input[name="lat"]');
  const lngInput = form.querySelector('input[name="lng"]');
  const locationPrompt = form.querySelector('#locationPrompt');
  const errorDiv = form.querySelector('#formError');
  const locateBtn = form.querySelector('#locateBtn');

  let mapRef;
  async function submitForm(e) {
    e.preventDefault();
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';

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

    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (isNaN(lat) || isNaN(lng)) {
      errorDiv.textContent = 'Please select a location on the map.';
      errorDiv.style.display = 'block';
      return;
    }
    const markerData = {
      type: typeSelect.value,
      status: statusSelect.value,
      notes: notesInput.value,
      lat,
      lng,
      user_id: appState.currentUser.id, // Add user ID to marker data
    };

    try {
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '⏳ Adding...';
      submitBtn.disabled = true;

      // Upload photo if selected
      if (photoInput.files[0]) {
        try {
          const photoResult = await uploadPhoto(photoInput.files[0]);
          markerData.photo_url = photoResult.url;
        } catch (photoError) {
          console.error('Photo upload failed:', photoError);
          // Continue without photo rather than failing completely
          alert('Photo upload failed, but marker will be added without photo.');
        }
      }

      // Use the new addMarker function
      const newMarker = await addMarker(markerData);

      if (mapRef) {
        addMarkerToMap(mapRef, newMarker);
      }

      form.reset();
      removePhoto(); // Clear photo preview
      latInput.value = '';
      lngInput.value = '';
      locationPrompt.textContent = '📍 Click the map to select location';
      locationPrompt.classList.remove('picked');

      // Reset button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;

      // Auto-collapse form after successful submission
      if (window.innerWidth <= 768) {
        formContainer.classList.remove('expanded');
      } else {
        // On desktop, collapse the panel and update toggle button
        formContainer.classList.add('panel-collapsed');
        const toggleBtn = document.querySelector('.panel-toggle-btn');
        if (toggleBtn) {
          toggleBtn.innerHTML = '📍 Add Sighting';
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
        updateFloatingHint();
      }

      console.log('Marker added successfully:', newMarker);
    } catch (err) {
      // Reset button
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Add Marker';
      submitBtn.disabled = false;

      errorDiv.textContent = err.message || 'Error adding marker';
      errorDiv.style.display = 'block';
    }
  }
  form.addEventListener('submit', submitForm);
  locateBtn.addEventListener('click', locateUser);
  photoInput.addEventListener('change', handlePhotoSelection);
  removePhotoBtn.addEventListener('click', removePhoto);
  function handleMapClick({ lng, lat }) {
    console.log('Map clicked', lat, lng);
    lngInput.value = lng;
    latInput.value = lat;
    locationPrompt.textContent = `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    locationPrompt.classList.add('picked');

    // Auto-expand form when location is selected
    if (window.innerWidth <= 768) {
      formContainer.classList.add('expanded');
    } else {
      // On desktop, expand the panel and update toggle button
      formContainer.classList.remove('panel-collapsed');
      const toggleBtn = document.querySelector('.panel-toggle-btn');
      if (toggleBtn) {
        toggleBtn.innerHTML = '✕ Close Panel';
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
      updateFloatingHint();
    }
  }

  function setMap(m) {
    mapRef = m;
  }

  // Geolocation function
  function locateUser() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    // Update button to show loading state
    const originalText = locateBtn.innerHTML;
    locateBtn.innerHTML = '🔄 Locating...';
    locateBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Check if coordinates are within NYC bounds (roughly)
        const nycBounds = {
          north: 41.0,
          south: 40.4,
          east: -73.4,
          west: -74.5,
        };

        if (
          latitude >= nycBounds.south &&
          latitude <= nycBounds.north &&
          longitude >= nycBounds.west &&
          longitude <= nycBounds.east
        ) {
          // Set the form coordinates
          latInput.value = latitude;
          lngInput.value = longitude;
          locationPrompt.textContent = `📍 Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          locationPrompt.classList.add('picked');

          // Center the map on user's location
          if (mapRef) {
            mapRef.flyTo({
              center: [longitude, latitude],
              zoom: 16, // Zoom in closer for precise placement
              duration: 1500,
            });
          }

          // Auto-expand form when location is found
          if (window.innerWidth <= 768) {
            formContainer.classList.add('expanded');
          } else {
            // On desktop, expand the panel and update toggle button
            formContainer.classList.remove('panel-collapsed');
            const toggleBtn = document.querySelector('.panel-toggle-btn');
            if (toggleBtn) {
              toggleBtn.innerHTML = '✕ Close Panel';
              toggleBtn.setAttribute('aria-expanded', 'true');
            }
          }
        } else {
          alert(
            'Your location appears to be outside of NYC. Please manually select a location on the map.'
          );
          locationPrompt.textContent = '📍 Click the map to select location';
        }

        // Reset button
        locateBtn.innerHTML = originalText;
        locateBtn.disabled = false;
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'The request to get location timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }

        alert(errorMessage + ' Please manually select a location on the map.');

        // Reset button
        locateBtn.innerHTML = originalText;
        locateBtn.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  }

  // Photo handling functions
  function handlePhotoSelection() {
    const file = photoInput.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        photoInput.value = '';
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB. Please choose a smaller image.');
        photoInput.value = '';
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  function removePhoto() {
    photoInput.value = '';
    photoPreview.style.display = 'none';
    previewImage.src = '';
  }

  // Event listeners for photo handling
  photoInput.addEventListener('change', handlePhotoSelection);
  removePhotoBtn.addEventListener('click', removePhoto);

  // Handle window resize to maintain proper behavior
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      // Mobile: remove desktop classes and use mobile behavior
      formContainer.classList.remove('panel-collapsed');
    } else {
      // Desktop: restore panel state based on stored preference
      const userPreference = localStorage.getItem('panelCollapsed');
      const shouldCollapse =
        userPreference === null ? true : userPreference === 'true';

      if (shouldCollapse) {
        formContainer.classList.add('panel-collapsed');
      } else {
        formContainer.classList.remove('panel-collapsed');
      }
    }
  });

  return { handleMapClick, setMap };
}
