import { signInWithPassword, signUpNewUser } from './supabase.js';

let authModal = null;
let closeButton = null;
let form = null;
let formTitle = null;
let authTabs = null;
let emailInput, passwordInput, displayNameInput, displayNameContainer, submitButton, switchLink, errorMessage;

// Function to create and inject the auth modal HTML
function createAuthModal() {
    if (document.getElementById('auth-modal')) return;

    const modalHTML = `
        <div id="auth-modal" class="auth-modal-overlay" style="display: none;">
            <div class="auth-modal-content">
                <button id="auth-close-btn" class="auth-close-btn">&times;</button>
                <div class="auth-tabs">
                    <button data-auth-tab="signin" class="auth-tab-btn active">Sign In</button>
                    <button data-auth-tab="signup" class="auth-tab-btn">Sign Up</button>
                </div>
                <h2 id="auth-form-title" class="auth-form-title">Sign In</h2>
                <form id="auth-form">
                    <div id="auth-error-message" class="auth-error-message" style="display: none;"></div>
                    <div id="display-name-container" style="display: none;">
                        <label for="display-name">Display Name</label>
                        <input type="text" id="display-name" name="display-name" placeholder="Your Name" />
                    </div>
                    <div>
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="your@email.com" />
                    </div>
                    <div>
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required placeholder="••••••••" />
                    </div>
                    <button type="submit" id="auth-submit-btn" class="auth-submit-btn">Sign In</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get references to all the elements
    authModal = document.getElementById('auth-modal');
    closeButton = document.getElementById('auth-close-btn');
    form = document.getElementById('auth-form');
    formTitle = document.getElementById('auth-form-title');
    authTabs = document.querySelector('.auth-tabs');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    displayNameInput = document.getElementById('display-name');
    displayNameContainer = document.getElementById('display-name-container');
    submitButton = document.getElementById('auth-submit-btn');
    errorMessage = document.getElementById('auth-error-message');

    // Add event listeners
    closeButton.addEventListener('click', hideAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            hideAuthModal();
        }
    });
    form.addEventListener('submit', handleFormSubmit);
    authTabs.addEventListener('click', handleTabSwitch);
}

function handleTabSwitch(e) {
    if (!e.target.matches('[data-auth-tab]')) return;

    const selectedTab = e.target.dataset.authTab;

    // Switch active tab style
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Reset form state
    errorMessage.style.display = 'none';
    form.reset();

    if (selectedTab === 'signup') {
        formTitle.textContent = 'Create an Account';
        submitButton.textContent = 'Sign Up';
        displayNameContainer.style.display = 'block';
        displayNameInput.required = true;
    } else { // signin
        formTitle.textContent = 'Sign In';
        submitButton.textContent = 'Sign In';
        displayNameContainer.style.display = 'none';
        displayNameInput.required = false;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    errorMessage.style.display = 'none';
    const isSignUp = displayNameContainer.style.display === 'block';
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        if (isSignUp) {
            const displayName = displayNameInput.value;
            if (!displayName) {
                showError('Display name is required for sign up.');
                return;
            }
            await signUpNewUser(email, password, displayName);
        } else {
            await signInWithPassword(email, password);
        }
        hideAuthModal();
    } catch (error) {
        showError(error.message);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

export function showAuthModal() {
    if (!authModal) createAuthModal();
    authModal.style.display = 'flex';
}

export function hideAuthModal() {
    if (!authModal) return;
    form.reset();
    errorMessage.style.display = 'none';
    // Reset to sign-in tab by default
    document.querySelector('[data-auth-tab="signin"]').click();
    authModal.style.display = 'none';
} 