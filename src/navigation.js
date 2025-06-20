// Navigation functionality for CityHive2
console.log('Navigation script loading...');

import { createWelcomeGuide } from './welcome.js';
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
    console.error('Header element not found');
    return;
  }

  // Clear existing header content to prevent duplication
  header.innerHTML = '';

  const nav = document.createElement('nav');
  nav.className = 'main-nav';

  // Logo
  const logoLink = document.createElement('a');
  logoLink.href = '/index.html';
  logoLink.innerHTML = `<img src="/cityhive-logo.svg" alt="CityHive Logo" class="logo">`;
  nav.appendChild(logoLink);

  // Nav links
  const ul = document.createElement('ul');
  navLinks.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    if (window.location.pathname === link.href) {
      a.classList.add('active');
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

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
        // The onAuthStateChange listener in main.js will handle the UI update
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
  
  nav.appendChild(authContainer);
  header.appendChild(nav);
}

// Try multiple initialization methods for better compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initNavigation(appState));
} else {
    initNavigation(appState);
}

// Fallback initialization
setTimeout(() => initNavigation(appState), 100);

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    try {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }
    } catch (error) {
        console.warn('Navigation scroll error:', error);
    }
});

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    try {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }
    } catch (error) {
        console.warn('Navigation scroll error:', error);
    }
});
