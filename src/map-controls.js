// Map Layer Controls System
import { toast } from './toast.js';

export class MapLayerControls {
  constructor(map) {
    this.map = map;
    this.controls = null;
    this.layers = {
      markers: {
        enabled: true,
        types: {
          hive: true,
          swarm: true,
          structure: true,
          tree: true,
        },
      },
      basemap: 'streets', // streets, satellite, hybrid
    };
    this.createControls();
  }

  createControls() {
    this.controls = document.createElement('div');
    this.controls.className = 'map-controls';
    this.controls.innerHTML = `
      <div class="map-controls-header" role="button" tabindex="0" aria-label="Toggle map layer controls">
        <h3>🗺️ Map Layers</h3>
        <button class="map-controls-toggle" aria-label="Toggle layer controls">
          <span class="toggle-icon">🔽</span>
        </button>
      </div>
      <div class="map-controls-content">
        <div class="control-section">
          <h4>Base Map</h4>
          <div class="basemap-options">
            <label class="basemap-option">
              <input type="radio" name="basemap" value="streets" checked>
              <span class="option-preview streets-preview"></span>
              <span class="option-label">Streets</span>
            </label>
            <label class="basemap-option">
              <input type="radio" name="basemap" value="satellite">
              <span class="option-preview satellite-preview"></span>
              <span class="option-label">Satellite</span>
            </label>
            <label class="basemap-option">
              <input type="radio" name="basemap" value="hybrid">
              <span class="option-preview hybrid-preview"></span>
              <span class="option-label">Hybrid</span>
            </label>
          </div>
        </div>

        <div class="control-section">
          <h4>Markers</h4>
          <label class="marker-toggle">
            <input type="checkbox" checked data-layer="markers">
            <span class="toggle-switch"></span>
            Show All Markers
          </label>

          <div class="marker-types">
            <label class="marker-type-toggle">
              <input type="checkbox" checked data-type="hive">
              <span class="marker-icon hive-icon">🍯</span>
              Hives
            </label>
            <label class="marker-type-toggle">
              <input type="checkbox" checked data-type="swarm">
              <span class="marker-icon swarm-icon">🐝</span>
              Swarms
            </label>
            <label class="marker-type-toggle">
              <input type="checkbox" checked data-type="structure">
              <span class="marker-icon structure-icon">🏢</span>
              Structures
            </label>
            <label class="marker-type-toggle">
              <input type="checkbox" checked data-type="tree">
              <span class="marker-icon tree-icon">🌳</span>
              Trees
            </label>
          </div>
        </div>

        <div class="control-section">
          <h4>View Options</h4>
          <label class="view-toggle">
            <input type="checkbox" data-view="cluster">
            <span class="toggle-switch"></span>
            Cluster Markers
          </label>
          <label class="view-toggle">
            <input type="checkbox" data-view="heatmap">
            <span class="toggle-switch"></span>
            Heat Map
          </label>
        </div>

        <div class="control-section">
          <h4>Quick Actions</h4>
          <div class="quick-actions">
            <button class="quick-action" data-action="locate">
              📍 My Location
            </button>
            <button class="quick-action" data-action="fitBounds">
              🗺️ Show All
            </button>
            <button class="quick-action" data-action="refresh">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to map
    if (this.map.getContainer) {
      this.map.getContainer().appendChild(this.controls);
    } else {
      document.getElementById('map').appendChild(this.controls);
    }

    this.bindEvents();
  }

  bindEvents() {
    // Toggle controls visibility
    const toggle = this.controls.querySelector('.map-controls-toggle');
    const header = this.controls.querySelector('.map-controls-header');
    const content = this.controls.querySelector('.map-controls-content');

    // Toggle function
    const toggleControls = () => {
      const isCollapsed = content.classList.contains('collapsed');
      content.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
      this.controls.classList.toggle('collapsed');

      // Update toggle icon
      const toggleIcon = toggle.querySelector('.toggle-icon');
      toggleIcon.textContent = isCollapsed ? '🔽' : '🔼';

      // Update aria-expanded
      header.setAttribute('aria-expanded', isCollapsed);

      // Add visual feedback to header
      header.classList.add('clicked');
      setTimeout(() => header.classList.remove('clicked'), 150);

      // Save preference
      localStorage.setItem('mapControlsCollapsed', !isCollapsed);

      // Show toast feedback
      if (typeof toast !== 'undefined') {
        setTimeout(() => {
          if (isCollapsed) {
            toast.info('Map controls expanded', 1500);
          } else {
            toast.info('Map controls collapsed', 1500);
          }
        }, 100);
      }
    };

    // Make entire header clickable
    header.addEventListener('click', toggleControls);

    // Add keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleControls();
      }
    });

    // Prevent double-click when clicking directly on toggle button
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Load saved state - default to collapsed for less visual clutter
    const savedState = localStorage.getItem('mapControlsCollapsed');
    const shouldCollapse = savedState === null ? true : savedState === 'true';

    if (shouldCollapse) {
      content.classList.add('collapsed');
      toggle.classList.add('collapsed');
      this.controls.classList.add('collapsed');

      // Update toggle icon and aria state
      const toggleIcon = toggle.querySelector('.toggle-icon');
      toggleIcon.textContent = '🔼';
      header.setAttribute('aria-expanded', 'false');
    } else {
      header.setAttribute('aria-expanded', 'true');
    }

    // Basemap changes
    const basemapInputs = this.controls.querySelectorAll(
      'input[name="basemap"]'
    );
    basemapInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.changeBasemap(e.target.value);
        }
      });
    });

    // Marker layer toggles
    const markerToggle = this.controls.querySelector(
      'input[data-layer="markers"]'
    );
    markerToggle.addEventListener('change', (e) => {
      this.layers.markers.enabled = e.target.checked;
      this.updateMarkerVisibility();
    });

    // Marker type toggles
    const typeToggles = this.controls.querySelectorAll('input[data-type]');
    typeToggles.forEach((toggle) => {
      toggle.addEventListener('change', (e) => {
        const type = e.target.dataset.type;
        this.layers.markers.types[type] = e.target.checked;
        this.updateMarkerVisibility();
      });
    });

    // View option toggles
    const viewToggles = this.controls.querySelectorAll('input[data-view]');
    viewToggles.forEach((toggle) => {
      toggle.addEventListener('change', (e) => {
        const view = e.target.dataset.view;
        this.toggleViewOption(view, e.target.checked);
      });
    });

    // Quick actions
    const quickActions = this.controls.querySelectorAll('.quick-action');
    quickActions.forEach((action) => {
      action.addEventListener('click', (e) => {
        const actionType = e.target.dataset.action;
        this.handleQuickAction(actionType);
      });
    });
  }

  changeBasemap(type) {
    this.layers.basemap = type;

    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
    if (!mapTilerKey) return;

    let styleUrl;
    switch (type) {
      case 'satellite':
        styleUrl = `https://api.maptiler.com/maps/satellite/style.json?key=${mapTilerKey}`;
        break;
      case 'hybrid':
        styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;
        break;
      case 'streets':
      default:
        styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
        break;
    }

    if (this.map.setStyle) {
      this.map.setStyle(styleUrl);
    }

    // Dispatch custom event for other components to listen
    document.dispatchEvent(
      new CustomEvent('basemapChanged', {
        detail: { type, styleUrl },
      })
    );
  }

  updateMarkerVisibility() {
    // Dispatch event for marker management
    document.dispatchEvent(
      new CustomEvent('markerVisibilityChanged', {
        detail: this.layers.markers,
      })
    );
  }

  toggleViewOption(option, enabled) {
    document.dispatchEvent(
      new CustomEvent('viewOptionChanged', {
        detail: { option, enabled },
      })
    );
  }

  handleQuickAction(action) {
    document.dispatchEvent(
      new CustomEvent('quickAction', {
        detail: { action },
      })
    );
  }

  destroy() {
    if (this.controls && this.controls.parentNode) {
      this.controls.parentNode.removeChild(this.controls);
    }
  }
}
