// Crosshair utility for Add Sighting mode
let crosshairElement = null;

/**
 * Creates and shows the crosshair on the map
 */
export function showCrosshair() {
  if (crosshairElement) {
    // If crosshair already exists, just make it visible
    crosshairElement.classList.add('visible', 'active');
    return;
  }

  // Create the crosshair element
  crosshairElement = document.createElement('div');
  crosshairElement.className = 'map-crosshair';

  // Add the center dot
  const centerDot = document.createElement('div');
  centerDot.className = 'crosshair-center';
  crosshairElement.appendChild(centerDot);

  // Find the map container and add the crosshair
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(crosshairElement);

    // Show with a slight delay for smooth animation
    setTimeout(() => {
      crosshairElement.classList.add('visible', 'active');
    }, 50);
  }
}

/**
 * Hides and removes the crosshair from the map
 */
export function hideCrosshair() {
  if (crosshairElement) {
    crosshairElement.classList.remove('visible', 'active');

    // Remove the element after the fade animation completes
    setTimeout(() => {
      if (crosshairElement && crosshairElement.parentNode) {
        crosshairElement.parentNode.removeChild(crosshairElement);
        crosshairElement = null;
      }
    }, 300); // Match the CSS transition duration
  }
}

/**
 * Checks if the crosshair is currently visible
 */
export function isCrosshairVisible() {
  return crosshairElement && crosshairElement.classList.contains('visible');
}

/**
 * Toggles the crosshair visibility
 */
export function toggleCrosshair() {
  if (isCrosshairVisible()) {
    hideCrosshair();
  } else {
    showCrosshair();
  }
}
