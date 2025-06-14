import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'
import { getComments, addComment, updateMarkerStatus } from './supabase.js'

console.log('map.js loaded, maplibregl:', maplibregl)

// Store marker references for management
let markerInstances = new Map()

export async function addMarkerToMap(map, { id, lat, lng, type, notes, photo_url, status }) {
  if (!map) return

  // Remove existing marker if it exists
  if (markerInstances.has(id)) {
    markerInstances.get(id).remove()
  }

  // Create popup with comments (with fallback)
  let popupContent
  try {
    popupContent = await createPopupContent(id, type, notes, photo_url, status)
  } catch (error) {
    console.warn('Using fallback popup for marker', id, ':', error)
    // Fallback to simple popup if comments fail
    popupContent = `
      <div class="marker-popup">
        <div class="marker-info">
          <strong class="marker-type">${type}</strong>
          <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">${getStatusEmoji(status)} ${status || 'Unverified'}</div>
          <p class="marker-notes">${notes}</p>
          <small class="marker-id">ID: ${id}</small>
        </div>
        <div class="comment-buttons">
          <button onclick="window.deleteMarker('${id}')" class="btn-delete">Delete Pin</button>
        </div>
      </div>
    `
  }
  
  const popup = new maplibregl.Popup({ 
    offset: 25,
    maxWidth: '350px'
  }).setHTML(popupContent)
  
  const marker = new maplibregl.Marker({
    color: getMarkerColor(type, status)
  })
    .setLngLat([lng, lat])
    .setPopup(popup)
    .addTo(map)

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
async function createPopupContent(markerId, type, notes, photo_url, status) {
  let comments = []
  
  // Try to get comments, but don't fail if there's an error
  try {
    comments = await getComments(markerId)
  } catch (error) {
    console.warn('Could not fetch comments for marker', markerId, ':', error)
    comments = []
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
      <img src="${photo_url}" alt="Bee sighting photo" onclick="window.openPhotoModal('${photo_url}')">
    </div>
  ` : ''

  return `
    <div class="marker-popup">
      <div class="marker-info">
        <strong class="marker-type">${type}</strong>
        <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">
          ${getStatusEmoji(status)} ${status || 'Unverified'}
        </div>
        <p class="marker-notes">${notes}</p>
        ${photoHtml}
        <small class="marker-id">ID: ${markerId}</small>
      </div>
      
      <div class="status-update-section">
        <label for="status-${markerId}" class="status-label">Update Status:</label>
        <select id="status-${markerId}" class="status-select">
          <option value="Unverified" ${status === 'Unverified' ? 'selected' : ''}>⚪ Unverified</option>
          <option value="Active" ${status === 'Active' ? 'selected' : ''}>🟢 Active</option>
          <option value="Checked" ${status === 'Checked' ? 'selected' : ''}>🟡 Checked</option>
          <option value="Gone" ${status === 'Gone' ? 'selected' : ''}>🔴 Gone</option>
          <option value="Removed" ${status === 'Removed' ? 'selected' : ''}>🗑️ Removed</option>
        </select>
        <button onclick="window.updateMarkerStatus('${markerId}')" class="btn-update-status">Update</button>
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
            <button onclick="window.deleteMarker('${markerId}')" class="btn-delete">Delete Pin</button>
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
  const authorInput = document.getElementById(`author-${markerId}`)
  const commentInput = document.getElementById(`comment-${markerId}`)
  
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
    if (commentInput) commentInput.value = ''    // Refresh the popup by getting the marker and updating its popup
    const marker = markerInstances.get(markerId)
    if (marker) {
      const popup = marker.getPopup()
      const markerData = { 
        id: markerId, 
        type: popup._content.querySelector('.marker-type')?.textContent || '',
        notes: popup._content.querySelector('.marker-notes')?.textContent || '',
        photo_url: popup._content.querySelector('.marker-photo img')?.src || null,
        status: popup._content.querySelector('.marker-status')?.textContent?.split(' ')[1] || 'Unverified'
      }
      const newContent = await createPopupContent(markerId, markerData.type, markerData.notes, markerData.photo_url, markerData.status)
      popup.setHTML(newContent)
    }
    
    console.log('Comment added successfully to marker:', markerId)
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment. Please try again.')
  }
}

// Global function to open photo modal
window.openPhotoModal = function(photoUrl) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('photoModal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'photoModal'
    modal.className = 'photo-modal'
    modal.innerHTML = `
      <div class="photo-modal-content">
        <span class="photo-modal-close">&times;</span>
        <img class="photo-modal-image" alt="Bee sighting photo">
      </div>
    `
    document.body.appendChild(modal)
    
    // Add click handlers
    modal.querySelector('.photo-modal-close').onclick = () => {
      modal.style.display = 'none'
    }
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    }
  }
  
  // Show modal with photo
  const img = modal.querySelector('.photo-modal-image')
  img.src = photoUrl
  modal.style.display = 'block'
}

export function createMap(containerId = 'map', onMapClick) {
  console.log('createMap called with containerId:', containerId)
  const mapContainer = document.getElementById(containerId)
  console.log('mapContainer found:', mapContainer)
  if (!mapContainer) {
    console.error('Map container not found!')
    return null
  }
  // Remove any placeholder text
  mapContainer.textContent = ''
  // NYC + 5 Boroughs bounds with some cushion
  // Covers: Manhattan, Brooklyn, Queens, Bronx, Staten Island
  // Plus parts of NJ, Westchester, and Long Island for context
  const nycBounds = [
    [-74.5, 40.4], // Southwest corner (longitude, latitude)
    [-73.4, 41.0]  // Northeast corner (longitude, latitude)
  ]

  try {
    const map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=mbriicWDtoa7yG1tmDK0',
      center: [-73.935242, 40.730610], // Manhattan center
      zoom: 11,
      minZoom: 9,  // Prevent zooming out too far
      maxZoom: 18, // Prevent zooming in beyond street level
      maxBounds: nycBounds // Restrict panning to NYC area
    })

    console.log('MapLibre map object created:', map)

    map.on('load', () => {
      console.log('Map loaded successfully!')
    })

    map.on('error', (e) => {
      console.error('Map error:', e)
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
`
document.head.append(style)

// Global function to update marker status
window.updateMarkerStatus = async (markerId) => {
  const statusSelect = document.getElementById(`status-${markerId}`)
  const newStatus = statusSelect?.value
  
  if (!newStatus) {
    alert('Please select a status')
    return
  }
  
  try {
    await updateMarkerStatus(markerId, newStatus)
    
    // Refresh the popup and marker color
    const marker = markerInstances.get(markerId)
    if (marker) {
      const popup = marker.getPopup()
      const markerData = { 
        id: markerId, 
        type: popup._content.querySelector('.marker-type')?.textContent || '',
        notes: popup._content.querySelector('.marker-notes')?.textContent || '',
        photo_url: popup._content.querySelector('.marker-photo img')?.src || null,
        status: newStatus
      }
      
      // Update marker color
      marker.getElement().style.backgroundColor = getMarkerColor(markerData.type, newStatus)
      
      // Refresh popup content
      const newContent = await createPopupContent(markerId, markerData.type, markerData.notes, markerData.photo_url, newStatus)
      popup.setHTML(newContent)
    }
    
    console.log('Marker status updated successfully:', markerId, newStatus)
  } catch (error) {
    console.error('Error updating marker status:', error)
    alert('Failed to update status. Please try again.')
  }
}

