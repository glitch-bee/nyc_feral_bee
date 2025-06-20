import { showAuthModal } from './auth.js';
import { signOut } from './supabase.js';

const navLinks = [
  { href: '/index.html', text: 'Map' },
  { href: '/about.html', text: 'About' },
  { href: '/resources.html', text: 'Resources' },
];

export function initNavigation(appState) {
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
  const brandDiv = document.createElement('div');
  brandDiv.className = 'nav-brand';
  
  const logoImg = document.createElement('img');
  logoImg.src = '/cityhivenew.png'; // Using the correct logo from the static files
  logoImg.alt = 'City Hive Logo';
  logoImg.className = 'nav-logo';
  brandDiv.appendChild(logoImg);
  
  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.textContent = 'City Hive';
  brandDiv.appendChild(brandText);

  navContainer.appendChild(brandDiv);

  // Nav links
  const navLinksDiv = document.createElement('div');
  navLinksDiv.className = 'nav-links';

  pages.forEach(page => {
    const a = document.createElement('a');
    a.href = page.path;
    a.textContent = page.name;
    a.className = 'nav-link';
    if (window.location.pathname.endsWith(page.path) || (window.location.pathname === '/' && page.path === 'index.html') || (window.location.pathname === '/cityhive2/' && page.path === 'index.html')) {
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