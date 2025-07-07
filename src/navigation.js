import { showAuthModal, hideAuthModal } from './auth.js';
import { supabase, signOut, onAuthStateChange } from './supabase.js';
import logoUrl from '/cityhive.png';

export function initNavigation(appState) {
  const pages = [
    { name: 'Map', path: 'index.html' },
    { name: 'About', path: 'about.html' },
    { name: 'Resources', path: 'resources.html' },
  ];

  const header = document.querySelector('header');
  if (!header) {
    console.error('Header element not found, appending nav to body.');
    // If header doesn't exist, we can create/append to body or another element.
    // For this case, let's assume we want to prepend it to the body.
  }
  if (header) {
    header.innerHTML = ''; // Clear it out
  }

  const nav = document.createElement('nav');
  nav.className = 'main-nav';

  const navContainer = document.createElement('div');
  navContainer.className = 'nav-container';

  // Brand section (Logo + Text)
  const brandLink = document.createElement('a');
  brandLink.href = 'index.html';
  brandLink.className = 'nav-brand';

  const logoLink = document.createElement('a');
  logoLink.href = '/cityhive2/';
  logoLink.style.display = 'flex';
  logoLink.style.flexDirection = 'column';
  logoLink.style.justifyContent = 'flex-start';
  logoLink.style.alignItems = 'flex-start';

  const logoImg = document.createElement('img');
  logoImg.src = logoUrl;
  logoImg.alt = 'City Hive Logo';
  logoImg.classList.add('nav-logo');

  logoLink.appendChild(logoImg);
  brandLink.appendChild(logoLink);

  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.textContent = 'City Hive';
  brandLink.appendChild(brandText);

  navContainer.appendChild(brandLink);

  // Nav links
  const navLinksDiv = document.createElement('div');
  navLinksDiv.className = 'nav-links';

  // Simple header - just text
  const sidebarHeader = document.createElement('div');
  sidebarHeader.innerHTML = 'City Hive';
  navLinksDiv.appendChild(sidebarHeader);

  // Navigation Links first
  pages.forEach((page) => {
    const a = document.createElement('a');
    a.href = page.path;
    a.textContent = page.name;
    a.className = 'nav-link';
    if (window.location.pathname.endsWith(page.path)) {
      a.classList.add('active');
    }
    navLinksDiv.appendChild(a);
  });

  // Add Sighting Button (only show on map page) - after navigation
  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const addBtn = document.createElement('button');
    addBtn.className = 'nav-add-sighting';
    addBtn.id = 'nav-add-sighting';
    addBtn.innerHTML = 'Add Sighting';
    navLinksDiv.appendChild(addBtn);
  }

  // Map Layers Button (only show on map page) - after Add Sighting
  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const mapBtn = document.createElement('button');
    mapBtn.className = 'nav-map-layers';
    mapBtn.id = 'mobile-map-layers';
    mapBtn.innerHTML = 'Map Layers';
    navLinksDiv.appendChild(mapBtn);
  }

  // Mobile hamburger toggle (will be positioned in right section)
  const navToggle = document.createElement('div');
  navToggle.className = 'nav-toggle';
  navToggle.setAttribute('aria-label', 'Toggle navigation menu');
  navToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  // Mobile menu functionality
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('nav-toggle-active');
    navLinksDiv.classList.toggle('nav-active');

    // Update aria-label for accessibility
    const isActive = navLinksDiv.classList.contains('nav-active');
    navToggle.setAttribute(
      'aria-label',
      isActive ? 'Close navigation menu' : 'Open navigation menu'
    );

    // Prevent body scrolling when menu is open
    document.body.style.overflow = isActive ? 'hidden' : '';

    // Close Add Sighting form if it's open
    const markerForm = document.getElementById('marker-form');
    if (markerForm && markerForm.classList.contains('expanded')) {
      markerForm.classList.remove('expanded');
      markerForm.style.display = 'none';
    }

    // Close Map Controls if they're open
    const mapControls = document.querySelector('.map-controls');
    if (mapControls && mapControls.style.display === 'block') {
      mapControls.style.display = 'none';
    }
  });

  // Close mobile menu when clicking nav links or auth buttons
  navLinksDiv.addEventListener('click', (e) => {
    // Helper function to close the menu
    const closeMenu = () => {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    };

    if (
      e.target.classList.contains('nav-link') ||
      e.target.classList.contains('login-btn') ||
      e.target.classList.contains('logout-btn') ||
      e.target.classList.contains('nav-add-sighting') ||
      e.target.classList.contains('nav-map-layers')
    ) {
      // Handle Add Sighting click
      if (e.target.id === 'nav-add-sighting') {
        closeMenu(); // Close menu first

        setTimeout(() => {
          const markerForm = document.getElementById('marker-form');
          if (markerForm) {
            // Show the mobile form drawer
            markerForm.style.display = 'block';
            markerForm.classList.remove('panel-collapsed');
            markerForm.classList.add('expanded');

            // Trigger the mobile form header click to expand it if on mobile
            const mobileHeader = markerForm.querySelector(
              '.mobile-form-header'
            );
            if (mobileHeader && window.innerWidth <= 768) {
              mobileHeader.click();
            }
          }
        }, 300); // Wait for menu to close
        return;
      }

      // Handle Map Layers click
      if (e.target.id === 'mobile-map-layers') {
        closeMenu(); // Close menu first

        setTimeout(() => {
          const mapControls = document.querySelector('.map-controls');
          if (mapControls) {
            mapControls.style.display = 'block';
            mapControls.style.position = 'fixed';
            mapControls.style.top = '50%';
            mapControls.style.left = '50%';
            mapControls.style.transform = 'translate(-50%, -50%)';
            mapControls.style.zIndex = '10004';
            mapControls.style.maxWidth = '90vw';
            mapControls.style.maxHeight = '80vh';
          }
        }, 300); // Wait for menu to close
        return;
      }

      // For regular nav links and auth buttons, just close the menu
      closeMenu();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !nav.contains(e.target) &&
      navLinksDiv.classList.contains('nav-active')
    ) {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }
  });

  // Close mobile menu on window resize if switching to desktop
  window.addEventListener('resize', () => {
    if (
      window.innerWidth > 768 &&
      navLinksDiv.classList.contains('nav-active')
    ) {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }
  });

  // Panel toggle button (only visible on desktop when not on main map page)
  const panelToggleContainer = document.createElement('div');
  panelToggleContainer.className = 'panel-toggle-container';

  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const panelToggleBtn = document.createElement('button');
    panelToggleBtn.className = 'panel-toggle-btn';
    panelToggleBtn.setAttribute('aria-label', 'Toggle marker form panel');
    panelToggleBtn.innerHTML = '📍 Add Sighting';

    panelToggleBtn.addEventListener('click', () => {
      const markerForm = document.getElementById('marker-form');
      if (markerForm) {
        markerForm.classList.toggle('panel-collapsed');
        const isCollapsed = markerForm.classList.contains('panel-collapsed');
        panelToggleBtn.innerHTML = isCollapsed
          ? '📍 Add Sighting'
          : '✕ Close Panel';
        panelToggleBtn.setAttribute('aria-expanded', !isCollapsed);

        // Remember user preference
        localStorage.setItem('panelCollapsed', isCollapsed.toString());
      }
    });

    panelToggleContainer.appendChild(panelToggleBtn);
  }

  // Create auth content helper function
  const createAuthContent = (containerClass) => {
    const authContainer = document.createElement('div');
    authContainer.className = containerClass;

    if (appState.currentUser && appState.userProfile) {
      // User is logged in
      const userNameEl = document.createElement('span');
      userNameEl.className = 'user-name';
      userNameEl.textContent = `Welcome, ${appState.userProfile.display_name || 'User'}`;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'logout-btn';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      });

      authContainer.appendChild(userNameEl);
      authContainer.appendChild(logoutBtn);
    } else {
      // User is logged out
      const loginBtn = document.createElement('button');
      loginBtn.className = 'login-btn';
      loginBtn.textContent = 'Login / Sign Up';
      loginBtn.addEventListener('click', showAuthModal);
      authContainer.appendChild(loginBtn);
    }

    return authContainer;
  };

  // Auth Button
  const mobileAuthContainer = createAuthContent('auth-container mobile-auth');
  navLinksDiv.appendChild(mobileAuthContainer);

  // Desktop auth container
  const desktopAuthContainer = createAuthContent('auth-container desktop-auth');

  // Combine nav links and panel toggle for desktop
  const rightSideContainer = document.createElement('div');
  rightSideContainer.style.display = 'flex';
  rightSideContainer.style.alignItems = 'center';
  rightSideContainer.style.gap = '2rem'; // Match gap from .nav-links

  rightSideContainer.appendChild(navLinksDiv);
  rightSideContainer.appendChild(navToggle);

  navContainer.appendChild(rightSideContainer);
  nav.appendChild(navContainer);

  if (header) {
    header.appendChild(nav);
  } else {
    document.body.prepend(nav);
  }
}
