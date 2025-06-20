import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'
import { getComments, addComment, updateMarkerStatus, deleteMarker, updateMarker, uploadPhoto } from './supabase.js'
import { appState } from './main.js'

console.log('map.js loaded, maplibregl:', maplibregl)

// Store marker references for management
export let markerInstances = new Map()
export let openPopup = null;

export async function addMarkerToMap(map, markerData) {
  const { id, lat, lng, type, notes, photo_url, status, user_id } = markerData;
  if (!map) return

  // Remove existing marker if it exists
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
  }

  // Create popup with comments (with fallback)
  let popupContent
  try {
    popupContent = await createPopupContent(markerData)
  } catch (error) {
    console.warn('Using fallback popup for marker', id, ':', error)
    // Fallback to simple popup if comments fail
    popupContent = `
      <div class="marker-popup">
        <div class="marker-info">
          <strong class="marker-type">${type}</strong>
          <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">${getStatusEmoji(status)} ${status || 'Unverified'}</div>
          <p class="marker-notes">${notes}</p>
          ${photoHtml}
        </div>
        <div class="comment-buttons">
          <button onclick="window.deleteMarker('${id}')" class="btn-delete">Delete Pin</button>
        </div>
      </div>
    `
  }
    // Check if mobile at time of marker creation
  const isMobileDevice = window.innerWidth <= 768

  const marker = new maplibregl.Marker({
    color: getMarkerColor(type, status)
  })
    .setLngLat([lng, lat])

  if (isMobileDevice) {
    // Mobile: NO popup, custom click handler only
    marker.getElement().addEventListener('click', async (e) => {
      e.stopPropagation()
      e.preventDefault()
      await showMobileMarkerInfo(markerData)
    })
  } else {
    // Desktop: create and attach popup
    const popup = new maplibregl.Popup({ 
      offset: 25,
      maxWidth: '350px',
      closeOnClick: false,
      closeOnMove: false,
      closeButton: true
    }).setHTML(popupContent)
    
    marker.setPopup(popup)
    // Manage only one open popup at a time
    popup.on('open', () => {
      if (openPopup && openPopup !== popup && openPopup.isOpen()) {
        openPopup.remove();
      }
      openPopup = popup;
    });
    // Prevent popup from closing except via close button
    popup.on('close', () => {
      openPopup = null;
    });
  }

  marker.addTo(map)

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

function getMarkerColor(type, status) {
  // Base colors by type
  const baseColors = {
    'Hive': '#ffaa00',
    'Swarm': '#ff6600', 
    'Structure': '#666666',
    'Tree': '#00aa00'
  }
  
  // Status modifications
  const statusModifiers = {
    'Active': 1.0,      // Full brightness
    'Checked': 0.8,     // Slightly dimmed
    'Unverified': 0.6,  // More dimmed
    'Gone': 0.3,        // Very dimmed
    'Removed': 0.2      // Almost grey
  }
  
  const baseColor = baseColors[type] || '#333333'
  const modifier = statusModifiers[status] || 0.6
  
  if (modifier === 1.0) return baseColor
  
  // Convert hex to RGB, apply modifier, convert back
  const hex = baseColor.replace('#', '')
  const r = Math.round(parseInt(hex.substr(0, 2), 16) * modifier)
  const g = Math.round(parseInt(hex.substr(2, 2), 16) * modifier)
  const b = Math.round(parseInt(hex.substr(4, 2), 16) * modifier)
  
  return `rgb(${r}, ${g}, ${b})`
}

function getStatusEmoji(status) {
  const emojis = {
    'Unverified': '⚪',
    'Active': '🟢',
    'Checked': '🟡',
    'Gone': '🔴',
    'Removed': '🗑️'
  }
  return emojis[status] || '⚪'
}

// Create popup content with comments
async function createPopupContent(markerData) {
  const { id: markerId, type, notes, photo_url, status, lat, lng, user_id } = markerData;
  let comments = []
  
  // Try to get comments, but don't fail if there's an error
  try {
    comments = await getComments(markerId)
  } catch (error) {
    console.warn('Could not fetch comments for marker', markerId, ':', error)
    comments = []
  }
  
  // --- ACTIONS (DELETE/EDIT) ---
  let actionsHtml = '';
  const currentUser = appState.currentUser;
  const userProfile = appState.userProfile;

  if (currentUser && (currentUser.id === user_id || userProfile?.is_admin)) {
    actionsHtml = `
      <div class="comment-buttons">
        <button onclick="window.deleteMarker('${markerId}')" class="btn-delete">Delete Pin</button>
      </div>
    `;
  }
  
  const commentsHtml = comments.length > 0 
    ? comments.map(comment => `
        <div class="comment">
          <div class="comment-author">${comment.author_name}</div>
          <div class="comment-text">${comment.comment_text}</div>
          <div class="comment-time">${formatDate(comment.timestamp)}</div>
        </div>
      `).join('')
    : '<div class="no-comments">No comments yet. Be the first to comment!</div>'
      const photoHtml = photo_url ? `
    <div class="marker-photo">
      <img src="${photo_url}" 
           alt="Bee sighting photo" 
           onclick="window.openPhotoModal('${photo_url}')"
           style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer;"
           onerror="this.style.display='none'; console.error('Failed to load image:', '${photo_url}');">
    </div>
  ` : `
    <div class="photo-upload-section">
      <label for="photo-${markerId}" class="status-label">Add Photo:</label>
      <input type="file" id="photo-${markerId}" accept="image/*" class="form-file" onchange="window.handleMarkerPhotoUpload('${markerId}', this)">
      <div id="photo-preview-${markerId}" style="display: none;" class="photo-preview">
        <img id="preview-img-${markerId}" alt="Photo preview">
        <button type="button" onclick="window.removeMarkerPhoto('${markerId}')" class="btn-remove-photo">✕</button>
      </div>
      <button onclick="window.uploadMarkerPhoto('${markerId}')" class="btn-update-status btn-upload-photo" style="margin-top: 8px;">Upload Photo</button>
    </div>
  `

  // Export to map app buttons
  const googleMapsUrl = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : '';
  const exportButtons = lat && lng ? `
    <div class="export-map-buttons" style="display:flex;gap:8px;margin:8px 0 4px 0;">
      <a href="${googleMapsUrl}" target="_blank" rel="noopener" class="export-map-btn google" style="background:#4285F4;color:#fff;padding:6px 12px;border-radius:6px;font-size:13px;text-decoration:none;display:inline-block;font-weight:600;">Google Maps</a>
    </div>
  ` : '';

  return `
    <div class="marker-popup">
      <div class="marker-info">
        <strong class="marker-type">${type}</strong>
        <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">
          ${getStatusEmoji(status)} ${status || 'Unverified'}
        </div>
        <p class="marker-notes">${notes}</p>
        ${photoHtml}
        ${exportButtons}
      </div>
        <div class="status-update-section">
        <label for="status-${markerId}" class="status-label">Update Status:</label>
        <select id="status-${markerId}" class="status-select">
          <option value="Unverified" ${status === 'Unverified' ? 'selected' : ''}>⚪ Unverified</option>
          <option value="Active" ${status === 'Active' ? 'selected' : ''}>🟢 Active</option>
          <option value="Checked" ${status === 'Checked' ? 'selected' : ''}>🟡 Checked</option>
          <option value="Gone" ${status === 'Gone' ? 'selected' : ''}>🔴 Gone</option>
          <option value="Removed" ${status === 'Removed' ? 'selected' : ''}>🗑️ Removed</option>
        </select>        <button onclick="window.updateMarkerStatus('${markerId}')" class="btn-update-status">Update</button>
      </div>
      
      <div class="comments-section">
        <h4>Comments (${comments.length})</h4>
        <div class="comments-list">
          ${commentsHtml}
        </div>
        
        <div class="add-comment-form">
          <input type="text" id="author-${markerId}" placeholder="Your name (optional)" class="comment-author-input">
          <textarea id="comment-${markerId}" placeholder="Add a comment..." class="comment-input"></textarea>
          <div class="comment-buttons">
            <button onclick="window.addCommentToMarker('${markerId}')" class="btn-comment">Add Comment</button>
            ${actionsHtml.replace('<div class="comment-buttons">', '').replace('</div>','')}
          </div>
        </div>
      </div>
    </div>
  `
}

// Helper function to format dates
function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}

// Global function to add comments (called from popup buttons)
window.addCommentToMarker = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    await addCommentToMarkerMobile(markerId);
  } else {
    // Desktop: handle comment addition
    let authorInput = document.getElementById(`author-${markerId}`) ||
                      document.querySelector(`#mobile-marker-info input[id*="author-${markerId}"]`) ||
                      document.querySelector(`.mobile-marker-info .comment-author-input`)
    
    let commentInput = document.getElementById(`comment-${markerId}`) ||
                       document.querySelector(`#mobile-marker-info textarea[id*="comment-${markerId}"]`) ||
                       document.querySelector(`.mobile-marker-info .comment-input`)
    
    const authorName = authorInput?.value.trim() || 'Anonymous'
    const commentText = commentInput?.value.trim()
    
    if (!commentText) {
      alert('Please enter a comment')
      return
    }
    
    try {
      await addComment(markerId, commentText, authorName)
      
      // Clear the inputs
      if (authorInput) authorInput.value = ''
      if (commentInput) commentInput.value = ''
      
      // Desktop: refresh popup content
      const marker = markerInstances.get(markerId)
      if (marker && marker.getPopup()) {
        // Simple reload for now - could be optimized later
        location.reload()      }
      
      console.log('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error adding comment: ' + error.message)
    }
  }
}

// Global function to open photo modal (lightbox)
window.openPhotoModal = function(photoUrl) {
  // Remove any existing modal
  let modal = document.getElementById('imageLightboxModal');
  if (modal) modal.remove();

  // Create modal
  modal = document.createElement('div');
  modal.id = 'imageLightboxModal';
  modal.className = 'image-lightbox-modal';
  modal.innerHTML = `
    <div class="image-lightbox-content">
      <button class="image-lightbox-close" aria-label="Close" tabindex="0">&times;</button>
      <img src="${photoUrl}" class="image-lightbox-img" alt="Bee sighting photo" />
    </div>
  `;
  document.body.appendChild(modal);
  document.body.classList.add('welcome-open');

  // Close logic
  const closeModal = () => {
    modal.remove();
    document.body.classList.remove('welcome-open');
  };
  modal.querySelector('.image-lightbox-close').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escListener);
    }
  });

  // Pinch-to-zoom (basic)
  const img = modal.querySelector('.image-lightbox-img');
  let scale = 1;
  let startDist = 0;
  let lastScale = 1;
  img.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      startDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastScale = scale;
    }
  });
  img.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(1, Math.min(4, lastScale * (newDist / startDist)));
      img.style.transform = `scale(${scale})`;
      e.preventDefault();
    }
  }, { passive: false });
  img.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) {
      lastScale = scale;
    }
  });
};

// Global function to delete marker (called from popup buttons)
window.deleteMarker = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    await deleteMarkerMobile(markerId);
  } else {
    // Desktop: handle marker deletion
    if (!confirm('Are you sure you want to delete this marker?')) {
      return;
    }    try {
      console.log('Deleting marker:', markerId);
      // Use the imported deleteMarker function from supabase
      const { deleteMarker: deleteMarkerFromSupabase } = await import('./supabase.js');
      await deleteMarkerFromSupabase(markerId);
      
      console.log('Marker deleted successfully');
      alert('Marker deleted successfully!');
      
      // Remove marker from map
      removeMarkerFromMap(markerId);
      
      // Reload page to refresh the UI
      location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete marker: ' + error.message);
    }
  }
}

export function createMap(containerId = 'map', onMapClick) {
  console.log('createMap called with containerId:', containerId)
  const mapContainer = document.getElementById(containerId)
  console.log('mapContainer found:', mapContainer)
  if (!mapContainer) {
    console.error('Map container not found!')
    return null
  }  // Remove any placeholder text and ensure container is ready
  mapContainer.textContent = ''
  mapContainer.style.width = '100%'
  mapContainer.style.height = '100%'
  
  // Force a reflow to ensure container dimensions are calculated
  mapContainer.offsetHeight
    // NYC + 5 Boroughs bounds with some cushion
  // Covers: Manhattan, Brooklyn, Queens, Bronx, Staten Island
  // Plus parts of NJ, Westchester, and Long Island for context
  const nycBounds = [
    [-74.5, 40.4], // Southwest corner (longitude, latitude)
    [-73.4, 41.0]  // Northeast corner (longitude, latitude)
  ]
  try {
    // Use environment variable if available, otherwise fallback to embedded key
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY || 'mbriicWDtoa7yG1tmDK0'
    console.log('Using MapTiler key:', mapTilerKey.substring(0, 8) + '...')
    
    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`,
      center: [-73.935242, 40.730610], // Manhattan center
      zoom: 11,
      minZoom: 9,  // Prevent zooming out too far
      maxZoom: 18, // Prevent zooming in beyond street level
      maxBounds: nycBounds // Restrict panning to NYC area
    })

    console.log('MapLibre map object created:', map)
    
    map.on('load', () => {
      console.log('Map loaded successfully!')
      // Force resize to ensure proper rendering
      setTimeout(() => {
        map.resize()
      }, 100)
    })
      map.on('error', (e) => {
      console.error('Map error:', e)
    })

    // Add resize handler for responsive behavior
    window.addEventListener('resize', () => {
      if (map) {
        map.resize()
      }
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

const style = document.createElement('style')
style.textContent = `
.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.marker-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.photo-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.photo-modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 28px;
  cursor: pointer;
}

.photo-modal-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.mobile-marker-info {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}

.mobile-marker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mobile-marker-content {
  flex: 1;
  overflow-y: auto;
}

.btn-close-mobile {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}
`
document.head.append(style)

// Global function to update marker status
window.updateMarkerStatus = async (markerId) => {
  if (window.innerWidth <= 768) {
    // Mobile: use mobile-specific handler
    const statusSelect = document.querySelector('#mobile-marker-info .status-select') ||
                        document.getElementById(`status-${markerId}`);
    if (statusSelect) {
      await updateMarkerStatusMobile(markerId, statusSelect.value);
    }
  } else {
    // Desktop: handle status update
    let statusSelect = document.getElementById(`status-${markerId}`) ||
                       document.querySelector(`#mobile-marker-info select[id*="status-${markerId}"]`) ||
                       document.querySelector(`.mobile-marker-info select`)
    
    const newStatus = statusSelect?.value
    
    if (!newStatus) {
      alert('Please select a status')
      return
    }
      try {
      const result = await updateMarkerStatus(markerId, newStatus)
      console.log('Status update result:', result)
        // If we get here, the update was successful
      console.log('Status updated successfully')
      
      // Desktop: refresh popup content
      alert('Status updated successfully!')
      location.reload()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status: ' + error.message)
    }
  }
}

// Make photo upload functions globally available for existing markers
window.handleMarkerPhotoUpload = handleMobilePhotoUpload;
window.uploadMarkerPhoto = uploadMarkerPhotoMobile;
window.removeMarkerPhoto = (markerId) => {
  const input = document.getElementById(`photo-${markerId}`);
  const preview = document.getElementById(`photo-preview-${markerId}`);
  
  if (input) input.value = '';
  if (preview) preview.style.display = 'none';
};

// Mobile detection utility
function isMobile() {
  return window.innerWidth <= 768
}

// Mobile marker info container
function createMobileMarkerInfo() {
  let mobileInfo = document.getElementById('mobile-marker-info')
  if (!mobileInfo) {
    mobileInfo = document.createElement('div')
    mobileInfo.id = 'mobile-marker-info'
    mobileInfo.className = 'mobile-marker-info'
    mobileInfo.style.display = 'none'
    document.body.appendChild(mobileInfo)
  }
  return mobileInfo
}

// Show marker info in mobile-friendly way
async function showMobileMarkerInfo(markerData) {
  const infoEl = createMobileMarkerInfo();
  const contentEl = infoEl.querySelector('.mobile-marker-info-content');
  const { id: markerId, type, notes, photo_url, status, user_id } = markerData;

  // This function now generates the full content for the mobile view,
  // including ownership checks.
  const contentHTML = await createPopupContent(markerData);
  contentEl.innerHTML = contentHTML;
  
  document.body.appendChild(infoEl);
  infoEl.style.display = 'flex';

  // Add event listeners for the mobile view's buttons
  const addCommentBtn = contentEl.querySelector('.btn-comment');
  if (addCommentBtn) {
    addCommentBtn.onclick = () => window.addCommentToMarker(markerId);
  }

  const deleteBtn = contentEl.querySelector('.btn-delete');
  if (deleteBtn) {
    deleteBtn.onclick = () => window.deleteMarker(markerId);
  }

  const updateStatusBtn = contentEl.querySelector('.btn-update-status');
  if (updateStatusBtn) {
    updateStatusBtn.onclick = () => window.updateMarkerStatus(markerId);
  }
  
  const closeModal = () => {
    infoEl.remove();
  };

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'btn-close-mobile';
  closeBtn.onclick = closeModal;
  contentEl.prepend(closeBtn);
}

// Add mobile-specific event listeners
function addMobileEventListeners(markerId) {
  // Status update button
  const statusBtn = document.querySelector('#mobile-marker-info .btn-update-status');
  if (statusBtn) {
    statusBtn.onclick = function() {
      const statusSelect = document.querySelector('#mobile-marker-info .status-select');
      if (statusSelect) {
        updateMarkerStatusMobile(markerId, statusSelect.value);
      }
    };
  }

  // Comment button
  const commentBtn = document.querySelector('#mobile-marker-info .btn-comment');
  if (commentBtn) {
    commentBtn.onclick = function() {
      addCommentToMarkerMobile(markerId);
    };
  }

  // Delete button
  const deleteBtn = document.querySelector('#mobile-marker-info .btn-delete');
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      deleteMarkerMobile(markerId);
    };
  }

  // Photo upload
  const photoInput = document.querySelector('#mobile-marker-info input[type="file"]');
  if (photoInput) {
    photoInput.onchange = function() {
      if (this.files && this.files[0]) {
        handleMobilePhotoUpload(markerId, this);
      }
    };
  }

  // Photo upload button
  const photoUploadBtn = document.querySelector('#mobile-marker-info .btn-upload-photo');
  if (photoUploadBtn) {
    photoUploadBtn.onclick = function() {
      uploadMarkerPhotoMobile(markerId);
    };
  }
}

// Close mobile marker info
window.closeMobileMarkerInfo = function() {
  const mobileInfo = document.getElementById('mobile-marker-info')
  if (mobileInfo) {
    mobileInfo.remove()
    // Re-enable body scrolling
    document.body.style.overflow = ''
  }
}

// Make mobile functions globally available
window.showMobileToast = showMobileToast;

// Mobile-specific functions with proper error handling
async function updateMarkerStatusMobile(markerId, newStatus) {
  try {
    await updateMarkerStatus(markerId, newStatus);
    
    showMobileToast('Status updated successfully!');
    closeMobileMarkerInfo();
    
    // Remove the old marker and add it back with new status
    const oldMarker = markerInstances.get(markerId);
    if (oldMarker) {
      const position = oldMarker.getLngLat();
      removeMarkerFromMap(markerId);
      
      // Find the marker data and update it
      const markerData = currentMarkers.find(m => m.id === markerId);
      if (markerData && window.map) {
        markerData.status = newStatus;
        await addMarkerToMap(window.map, markerData);
      }
    }
    
  } catch (error) {
    console.error('Status update failed:', error);
    alert('Failed to update status: ' + error.message);
  }
}

async function addCommentToMarkerMobile(markerId) {
  try {
    const nameInput = document.querySelector('#mobile-marker-info .comment-author-input');
    const commentInput = document.querySelector('#mobile-marker-info .comment-input');
    
    if (!nameInput || !commentInput) {
      console.error('Comment inputs not found');
      alert('Error: Comment form not found');
      return;
    }

    const authorName = nameInput.value.trim() || 'Anonymous';
    const commentText = commentInput.value.trim();

    if (!commentText) {
      alert('Please enter a comment');
      return;
    }    console.log('Adding comment:', { markerId, authorName, commentText });
    
    await addComment(markerId, commentText, authorName);
    
    console.log('Comment added successfully');
    showMobileToast('Comment added successfully!');
    closeMobileMarkerInfo();
    
  } catch (error) {
    console.error('Comment failed:', error);
    alert('Failed to add comment: ' + error.message);
  }
}

async function deleteMarkerMobile(markerId) {
  if (!confirm('Are you sure you want to delete this marker?')) {
    return;
  }  try {
    console.log('Deleting marker:', markerId);
    // Use the imported deleteMarker function from supabase
    const { deleteMarker: deleteMarkerFromSupabase } = await import('./supabase.js');
    await deleteMarkerFromSupabase(markerId);
    
    console.log('Marker deleted successfully');
    showMobileToast('Marker deleted successfully!');
    closeMobileMarkerInfo();
    
    // Remove marker from map immediately
    removeMarkerFromMap(markerId);
    
    // Remove from currentMarkers array
    if (window.currentMarkers) {
      window.currentMarkers = window.currentMarkers.filter(m => m.id !== markerId);
    }
    
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete marker: ' + error.message);
  }
}

async function handleMobilePhotoUpload(markerId, fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;

  const preview = document.querySelector(`#photo-preview-${markerId}`);
  const previewImg = document.querySelector(`#preview-img-${markerId}`);
  
  if (preview && previewImg) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

async function uploadMarkerPhotoMobile(markerId) {
  const input = document.querySelector(`#photo-${markerId}`);
  const file = input?.files?.[0];
  
  if (!file) {
    alert('Please select a photo first');
    return;
  }

  try {
    console.log('Uploading photo for marker:', markerId);
    showMobileToast('Uploading photo...');
    
    const photoResult = await uploadPhoto(file);
    console.log('Photo uploaded, result:', photoResult);
    
    await updateMarker(markerId, { photo_url: photoResult.url });
    
    console.log('Photo saved successfully');
    showMobileToast('Photo uploaded successfully!');
    closeMobileMarkerInfo();
    
  } catch (error) {
    console.error('Photo upload failed:', error);
    alert('Failed to upload photo: ' + error.message);
  }
}

// Mobile toast notification
function showMobileToast(message) {
  const toast = document.createElement('div');
  toast.className = 'mobile-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function getOpenPopup() { return openPopup; }
export function getMarkerInstances() { return markerInstances; }

