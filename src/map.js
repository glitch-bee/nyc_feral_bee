import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import {
  getAllMarkers,
  getComments,
  addComment,
  updateMarkerStatus,
  deleteMarker,
  updateMarker,
  uploadPhoto,
} from './supabase.js';
import { appState } from './main.js';

console.log('map.js loaded');

// --- MODULE-LEVEL STATE ---
let mapInstance = null;
export let markerInstances = new Map();
export let openPopup = null;
let mapEventListeners = new Map(); // Track event listeners for cleanup

export function setMap(map) {
  mapInstance = map;
}

// --- MAP INITIALIZATION ---
export function initMap(containerId = 'map', onMapClick) {
  const mapContainer = document.getElementById(containerId);
  if (!mapContainer) {
    console.error('Map container not found!');
    return null;
  }

  mapContainer.textContent = ''; // Clear placeholder
  mapContainer.style.width = '100%';
  mapContainer.style.height = '100%';

  const nycBounds = [
    [-74.5, 40.4], // Southwest
    [-73.4, 41.0], // Northeast
  ];

  try {
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
    if (!mapTilerKey) {
      const warning =
        'VITE_MAPTILER_KEY is not set. Please get a key from maptiler.com and add it to your .env file.';
      console.warn(warning);
      // Optionally, display this message on the map itself
      mapContainer.innerHTML = `<div class="map-error-message">${warning}</div>`;
      return null;
    }
    const map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`,
      center: [-73.935242, 40.73061],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      maxBounds: nycBounds,
    });

    map.on('load', () => {
      console.log('Map loaded successfully!');
      setTimeout(() => map.resize(), 100);
    });

    map.on('error', (e) => {
      // Handle AbortErrors gracefully - these are normal during tile loading
      if (e.error && e.error.name === 'AbortError') {
        console.debug(
          'Tile request aborted (normal behavior):',
          e.error.message
        );
        return;
      }
      console.error('Map error:', e);
    });

    // Handle aborted source data requests gracefully
    map.on('sourcedataabort', (e) => {
      console.debug('Source data request aborted:', e.sourceId);
    });

    // Store resize handler for cleanup
    const resizeHandler = () => map?.resize();
    window.addEventListener('resize', resizeHandler);
    mapEventListeners.set('resize', resizeHandler);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    // Make some functions globally available for inline event handlers
    window.deleteMarker = handleDeleteMarker;
    window.updateMarkerStatus = handleUpdateMarkerStatus;
    window.addCommentToMarker = handleAddComment;
    window.openPhotoModal = openPhotoModal;

    // Store map instance for cleanup
    mapInstance = map;
    return map;
  } catch (error) {
    console.error('Error creating map:', error);
    return null;
  }
}

// --- MARKER AND DATA LOADING ---
export async function loadMarkers() {
  console.log('loadMarkers called, mapInstance:', mapInstance);
  if (!mapInstance) {
    console.error('No map instance available for loading markers');
    return;
  }
  try {
    console.log('Fetching markers from database...');
    const markers = await getAllMarkers();
    console.log('Fetched markers:', markers);

    clearAllMarkers();

    if (markers && markers.length > 0) {
      console.log(`Adding ${markers.length} markers to map`);
      for (const marker of markers) {
        await addMarkerToMap(mapInstance, marker);
      }
      console.log('All markers added successfully');
    } else {
      console.log('No markers found in database');
    }
  } catch (error) {
    console.error('Error loading markers:', error);
  }
}

export async function addMarkerToMap(map, markerData) {
  if (!map) return;
  const { id } = markerData;

  if (markerInstances.has(id)) {
    markerInstances.get(id).remove();
  }

  const popupContent = await createPopupContent(markerData);
  const isMobileDevice = window.innerWidth <= 768;

  const marker = new maplibregl.Marker({
    color: getMarkerColor(markerData.type, markerData.status),
  }).setLngLat([markerData.lng, markerData.lat]);

  if (isMobileDevice) {
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      showMobileMarkerInfo(markerData);
    });
  } else {
    const popup = new maplibregl.Popup({
      offset: 25,
      maxWidth: '350px',
      closeOnClick: false,
      closeOnMove: false,
      closeButton: true,
    }).setHTML(popupContent);
    marker.setPopup(popup);

    popup.on('open', () => {
      if (openPopup && openPopup !== popup && openPopup.isOpen()) {
        openPopup.remove();
      }
      openPopup = popup;
    });
    popup.on('close', () => {
      openPopup = null;
    });
  }

  marker.addTo(map);
  markerInstances.set(id, marker);
}

export function removeMarkerFromMap(id) {
  const marker = markerInstances.get(id);
  if (marker) {
    marker.remove();
    markerInstances.delete(id);
  }
}

export function clearAllMarkers() {
  markerInstances.forEach((marker) => marker.remove());
  markerInstances.clear();
}

// --- CLEANUP FUNCTIONS ---
export function cleanupMap() {
  console.log('Cleaning up map resources...');

  // Clear all markers
  clearAllMarkers();

  // Close any open popups
  if (openPopup && openPopup.isOpen()) {
    openPopup.remove();
    openPopup = null;
  }

  // Remove event listeners
  mapEventListeners.forEach((handler, event) => {
    if (event === 'resize') {
      window.removeEventListener('resize', handler);
    }
  });
  mapEventListeners.clear();

  // Remove map instance
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  console.log('Map cleanup completed');
}

// --- POPUP AND MOBILE VIEW CONTENT ---
async function createPopupContent(markerData) {
  const {
    id: markerId,
    type,
    notes,
    photo_url,
    status,
    lat,
    lng,
    user_id,
  } = markerData;

  // Admin/Ownership Check
  let actionsHtml = '';
  if (
    appState.currentUser &&
    (appState.currentUser.id === user_id || appState.userProfile?.is_admin)
  ) {
    actionsHtml = `<button onclick="window.deleteMarker('${markerId}')" class="btn-delete">Delete Pin</button>`;
  }

  // Comments
  let comments = [];
  try {
    comments = await getComments(markerId);
  } catch (error) {
    console.warn('Could not fetch comments for marker', markerId, ':', error);
  }
  const commentsHtml =
    comments.length > 0
      ? comments
          .map(
            (c) => `
            <div class="comment">
                <div class="comment-author">${c.author_name}</div>
                <div class="comment-text">${c.comment_text}</div>
                <div class="comment-time">${formatDate(c.timestamp)}</div>
            </div>`
          )
          .join('')
      : '<div class="no-comments">No comments yet.</div>';

  // Photo
  const photoHtml = photo_url
    ? `<div class="marker-photo"><img src="${photo_url}" alt="Bee photo" onclick="window.openPhotoModal('${photo_url}')"></div>`
    : ''; // Add photo upload form here if desired for popups

  return `
        <div class="marker-popup">
            <div class="marker-info">
                <strong class="marker-type">${type}</strong>
                <div class="marker-status status-${status?.toLowerCase() || 'unverified'}">${getStatusEmoji(status)} ${status || 'Unverified'}</div>
                <p class="marker-notes">${notes || 'No notes available.'}</p>
                ${photoHtml}
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
                <h4>Comments</h4>
                <div class="comments-list">${commentsHtml}</div>
                <div class="add-comment-form">
                    <input type="text" id="author-${markerId}" placeholder="Your name (optional)" class="comment-author-input">
                    <textarea id="comment-${markerId}" placeholder="Add a comment..." class="comment-input"></textarea>
                    <div class="comment-buttons">
                        <button onclick="window.addCommentToMarker('${markerId}')" class="btn-comment">Add Comment</button>
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showMobileMarkerInfo(markerData) {
  let mobileInfo = document.getElementById('mobile-marker-info');
  if (!mobileInfo) {
    mobileInfo = document.createElement('div');
    mobileInfo.id = 'mobile-marker-info';
    mobileInfo.className = 'mobile-marker-info';
    document.body.appendChild(mobileInfo);
  }

  const close = () => (mobileInfo.style.display = 'none');

  createPopupContent(markerData).then((contentHTML) => {
    mobileInfo.innerHTML = `
            <div class="mobile-marker-content-wrapper">
                <div class="mobile-marker-header">
                    <h3>Marker Details</h3>
                    <button id="mobile-close-btn" class="btn-close-mobile">&times;</button>
                </div>
                <div class="mobile-marker-content">${contentHTML}</div>
            </div>
        `;
    mobileInfo.style.display = 'flex';
    document.getElementById('mobile-close-btn').onclick = close;
  });
}

// --- EVENT HANDLERS (for inline onlick) ---
async function handleDeleteMarker(markerId) {
  if (!confirm('Are you sure you want to delete this marker?')) return;
  try {
    await deleteMarker(markerId);
    removeMarkerFromMap(markerId);
    alert('Marker deleted successfully!');
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete marker: ' + error.message);
  }
}

async function handleUpdateMarkerStatus(markerId) {
  const select = document.getElementById(`status-${markerId}`);
  const newStatus = select?.value;
  if (!newStatus) return;

  try {
    await updateMarkerStatus(markerId, newStatus);
    alert('Status updated successfully!');
    loadMarkers(); // Refresh markers
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status: ' + error.message);
  }
}

async function handleAddComment(markerId) {
  const authorInput = document.getElementById(`author-${markerId}`);
  const commentInput = document.getElementById(`comment-${markerId}`);
  const authorName = authorInput?.value.trim() || 'Anonymous';
  const commentText = commentInput?.value.trim();

  if (!commentText) {
    alert('Please enter a comment.');
    return;
  }

  try {
    await addComment(markerId, commentText, authorName);
    if (commentInput) commentInput.value = '';
    loadMarkers(); // Refresh markers to show the new comment
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Error adding comment: ' + error.message);
  }
}

function openPhotoModal(photoUrl) {
  let modal = document.getElementById('imageLightboxModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'imageLightboxModal';
  modal.className = 'image-lightbox-modal';
  modal.innerHTML = `
        <div class="image-lightbox-content">
            <button class="image-lightbox-close">&times;</button>
            <img src="${photoUrl}" alt="Bee sighting photo" />
        </div>
    `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.image-lightbox-close').onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

// --- UTILITY FUNCTIONS ---
function getMarkerColor(type, status) {
  const baseColors = {
    Hive: '#8a7f1d', // brown-300
    Swarm: '#958b3e', // warm-sage-600
    Structure: '#8d8764', // sage-600
    Tree: '#7c9082', // reseda-500
  };
  const statusModifiers = {
    Active: 1.0,
    Checked: 0.8,
    Unverified: 0.6,
    Gone: 0.3,
    Removed: 0.2,
  };
  const baseColor = baseColors[type] || '#433e0e';
  const modifier = statusModifiers[status] || 0.6;
  if (modifier === 1.0) return baseColor;
  const hex = baseColor.replace('#', '');
  const r = Math.round(parseInt(hex.substr(0, 2), 16) * modifier);
  const g = Math.round(parseInt(hex.substr(2, 2), 16) * modifier);
  const b = Math.round(parseInt(hex.substr(4, 2), 16) * modifier);
  return `rgb(${r}, ${g}, ${b})`;
}

function getStatusEmoji(status) {
  const emojis = {
    Unverified: '⚪',
    Active: '🟢',
    Checked: '���',
    Gone: '🔴',
    Removed: '🗑️',
  };
  return emojis[status] || '⚪';
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
