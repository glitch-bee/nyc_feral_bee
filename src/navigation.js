import { showAuthModal, hideAuthModal } from './auth.js';
import { supabase, signOut, onAuthStateChange } from './supabase.js';
import logoUrl from '/public/cityhive.png';

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

  // Combine nav links and auth section
  const rightSideContainer = document.createElement('div');
  rightSideContainer.style.display = 'flex';
  rightSideContainer.style.alignItems = 'center';
  rightSideContainer.style.gap = '2rem'; // Match gap from .nav-links

  rightSideContainer.appendChild(navLinksDiv);

  // Auth section
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-container';

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

  rightSideContainer.appendChild(authContainer);
  navContainer.appendChild(rightSideContainer);
  nav.appendChild(navContainer);

  if (header) {
    header.appendChild(nav);
  } else {
    document.body.prepend(nav);
  }
}
