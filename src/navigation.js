// Navigation functionality for CityHive2
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('nav-active');
            navToggle.classList.toggle('nav-toggle-active');
        });
    }

    // Close mobile nav when clicking on links
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('nav-active');
            navToggle.classList.remove('nav-toggle-active');
        });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navLinks.contains(event.target);
        
        if (!isClickInsideNav && navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            navToggle.classList.remove('nav-toggle-active');
        }
    });

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
});

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }
});
