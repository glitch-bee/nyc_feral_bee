import { signInWithPassword, signUpNewUser } from './supabase.js';

let authModal = null;
let closeButton = null;
let form = null;
let formTitle = null;
let authTabs = null;
let emailInput,
  passwordInput,
  displayNameInput,
  displayNameContainer,
  submitButton,
  switchLink,
  errorMessage;

// Function to create and inject the auth modal HTML
function createAuthModal() {
  // Remove any existing modal first
  const existingModal = document.getElementById('auth-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal element
  const modalElement = document.createElement('div');
  modalElement.id = 'auth-modal';
  modalElement.className = 'auth-modal-overlay';
  modalElement.style.display = 'none';

  modalElement.innerHTML = `
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
                    <input type="text" id="display-name" name="display-name" placeholder="Your Name" autocomplete="name" />
                </div>
                <div class="form-field">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required placeholder="your@email.com" autocomplete="email" style="opacity: 1; visibility: visible; display: block; background: var(--white); color: var(--text-primary);" />
                </div>
                <div class="form-field">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="••••••••" autocomplete="current-password" style="opacity: 1; visibility: visible; display: block; background: var(--white); color: var(--text-primary);" />
                </div>
                <button type="submit" id="auth-submit-btn" class="auth-submit-btn">Sign In</button>
            </form>
        </div>
    `;

  document.body.appendChild(modalElement);

  // Get references to all the elements from the newly created modal
  authModal = modalElement;
  closeButton = modalElement.querySelector('#auth-close-btn');
  form = modalElement.querySelector('#auth-form');
  formTitle = modalElement.querySelector('#auth-form-title');
  authTabs = modalElement.querySelector('.auth-tabs');
  emailInput = modalElement.querySelector('#email');
  passwordInput = modalElement.querySelector('#password');
  displayNameInput = modalElement.querySelector('#display-name');
  displayNameContainer = modalElement.querySelector('#display-name-container');
  submitButton = modalElement.querySelector('#auth-submit-btn');
  errorMessage = modalElement.querySelector('#auth-error-message');

  console.log('Auth modal elements:', {
    authModal: !!authModal,
    emailInput: !!emailInput,
    passwordInput: !!passwordInput,
    form: !!form,
  });

  // Add event listeners with safety checks
  if (closeButton) {
    closeButton.addEventListener('click', hideAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        hideAuthModal();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (authTabs) {
    authTabs.addEventListener('click', handleTabSwitch);
  }
}

function handleTabSwitch(e) {
  if (!e.target.matches('[data-auth-tab]')) return;

  const selectedTab = e.target.dataset.authTab;

  // Switch active tab style
  document
    .querySelectorAll('.auth-tab-btn')
    .forEach((btn) => btn.classList.remove('active'));
  e.target.classList.add('active');

  // Reset form state
  errorMessage.style.display = 'none';
  form.reset();

  if (selectedTab === 'signup') {
    formTitle.textContent = 'Create an Account';
    submitButton.textContent = 'Sign Up';
    displayNameContainer.style.display = 'block';
    displayNameInput.required = true;
  } else {
    // signin
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
  console.log('showAuthModal called');

  if (!authModal) {
    console.log('Creating auth modal');
    createAuthModal();
  }

  if (authModal) {
    console.log('Showing auth modal');
    authModal.style.display = 'flex';

    // Verify inputs exist and are visible
    const emailCheck = document.getElementById('email');
    const passwordCheck = document.getElementById('password');
    console.log('Email input found:', emailCheck);
    console.log('Password input found:', passwordCheck);
    
    if (emailCheck) {
      emailCheck.addEventListener('focus', () => console.log('Email input focused'));
      emailCheck.addEventListener('mousedown', () => console.log('Email input mousedown'));
      emailCheck.addEventListener('keydown', (e) => console.log('Email input keydown', e.key));
    }
    if (passwordCheck) {
      passwordCheck.addEventListener('focus', () => console.log('Password input focused'));
      passwordCheck.addEventListener('mousedown', () => console.log('Password input mousedown'));
      passwordCheck.addEventListener('keydown', (e) => console.log('Password input keydown', e.key));
    }

    if (emailCheck) {
      console.log('Email input styles:', {
        display: emailCheck.style.display,
        visibility: emailCheck.style.visibility,
        opacity: emailCheck.style.opacity,
        background: emailCheck.style.background,
        color: emailCheck.style.color,
        zIndex: emailCheck.style.zIndex
      });
    }
    
    if (passwordCheck) {
      console.log('Password input styles:', {
        display: passwordCheck.style.display,
        visibility: passwordCheck.style.visibility,
        opacity: passwordCheck.style.opacity,
        background: passwordCheck.style.background,
        color: passwordCheck.style.color,
        zIndex: passwordCheck.style.zIndex
      });
    }

    // Focus the first input
    setTimeout(() => {
      if (emailInput || emailCheck) {
        const targetInput = emailInput || emailCheck;
        targetInput.focus();
        console.log('Focused email input');
        
        // Force input to be visible
        targetInput.style.opacity = '1';
        targetInput.style.visibility = 'visible';
        targetInput.style.display = 'block';
        targetInput.style.background = 'var(--white)';
        targetInput.style.color = 'var(--text-primary)';
      }
    }, 100);
  } else {
    console.error('Auth modal still not found after creation');
  }
}

export function hideAuthModal() {
  if (!authModal) return;
  form.reset();
  errorMessage.style.display = 'none';
  // Reset to sign-in tab by default
  document.querySelector('[data-auth-tab="signin"]').click();
  authModal.style.display = 'none';
}
