// Navigation functionality for CityHive2
console.log('Navigation script loading...');

import { createWelcomeGuide } from './welcome.js';

function initNavigation() {
    console.log('Initializing navigation...');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('navToggle found:', navToggle);
    console.log('navLinks found:', navLinks);

    // Mobile navigation toggle
    if (navToggle && navLinks) {
        // Remove any existing listeners to prevent duplicates
        navToggle.replaceWith(navToggle.cloneNode(true));
        const newNavToggle = document.getElementById('navToggle');
        
        newNavToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Nav toggle clicked');
            navLinks.classList.toggle('nav-active');
            newNavToggle.classList.toggle('nav-toggle-active');
        });

        // Close mobile nav when clicking on links
        const navLinkElements = navLinks.querySelectorAll('.nav-link');
        navLinkElements.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('nav-active');
                newNavToggle.classList.remove('nav-toggle-active');
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = newNavToggle.contains(event.target) || navLinks.contains(event.target);
            
            if (!isClickInsideNav && navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                newNavToggle.classList.remove('nav-toggle-active');
            }
        });
        
        console.log('Navigation event listeners attached');
    } else {
        console.warn('Navigation elements not found!');
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add welcome guide link to navigation only if not already present
    if (navLinks && !navLinks.querySelector('.welcome-link')) {
        const welcomeLink = document.createElement('a');
        welcomeLink.className = 'nav-link welcome-link';
        welcomeLink.innerHTML = '📖 Guide';
        welcomeLink.href = '#';
        welcomeLink.style.cursor = 'pointer';
        welcomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            const welcomeGuide = createWelcomeGuide();
            welcomeGuide.show();
        });
        navLinks.appendChild(welcomeLink);
    }
}

// Try multiple initialization methods for better compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

// Fallback initialization
setTimeout(initNavigation, 100);

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
