// Progressive Form and Preview System
export class FormEnhancements {
  constructor(formContainer) {
    this.formContainer = formContainer;
    this.form = formContainer.querySelector('#markerForm');

    if (!this.form) {
      console.error('MarkerForm not found in container');
      return;
    }

    this.preview = null;
    this.currentStep = 0;
    this.steps = ['type', 'status', 'location', 'details', 'preview'];
    this.formData = {};
    this.init();
  }

  init() {
    if (!this.form) {
      console.error('Cannot initialize FormEnhancements without a valid form');
      return;
    }

    this.createProgressBar();
    this.createPreviewPanel();
    this.makeFormProgressive();
    this.bindEvents();
    this.updateProgress();
  }

  bindEvents() {
    // Form validation on change
    this.form.addEventListener('change', () => {
      this.updatePreview();
      this.validateCurrentStep();
    });

    // Form input events
    this.form.addEventListener('input', () => {
      this.updatePreview();
    });

    // Progress step indicators click events
    const stepIndicators = this.form.querySelectorAll('.step-indicator');
    stepIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        if (index <= this.currentStep || this.validateStepsUpTo(index - 1)) {
          this.goToStep(index);
        }
      });
    });
  }

  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'form-progress';
    progressBar.innerHTML = `
      <div class="progress-steps">
        <div class="step-indicator active" data-step="0">
          <span class="step-number">1</span>
          <span class="step-label">Type</span>
        </div>
        <div class="step-indicator" data-step="1">
          <span class="step-number">2</span>
          <span class="step-label">Status</span>
        </div>
        <div class="step-indicator" data-step="2">
          <span class="step-number">3</span>
          <span class="step-label">Location</span>
        </div>
        <div class="step-indicator" data-step="3">
          <span class="step-number">4</span>
          <span class="step-label">Details</span>
        </div>
        <div class="step-indicator" data-step="4">
          <span class="step-number">5</span>
          <span class="step-label">Preview</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 20%"></div>
      </div>
    `;

    this.form.insertBefore(progressBar, this.form.firstChild);
  }

  createPreviewPanel() {
    this.preview = document.createElement('div');
    this.preview.className = 'form-preview';
    this.preview.innerHTML = `
      <div class="preview-header">
        <h4>Preview</h4>
        <button type="button" class="preview-toggle" aria-label="Toggle preview">
          👁️
        </button>
      </div>
      <div class="preview-content">
        <div class="preview-marker">
          <div class="marker-preview-icon">🐝</div>
          <div class="marker-preview-details">
            <div class="preview-type">Select a type</div>
            <div class="preview-status">Select status</div>
            <div class="preview-location">Select location</div>
            <div class="preview-notes">Add notes...</div>
          </div>
        </div>
      </div>
    `;

    this.formContainer.appendChild(this.preview);
    this.bindPreviewEvents();
  }

  makeFormProgressive() {
    const formGroups = this.form.querySelectorAll('.form-group');

    // Group form elements by step
    const stepGroups = {
      0: [formGroups[0]], // type
      1: [formGroups[1]], // status
      2: [formGroups[4], formGroups[5]], // location controls
      3: [formGroups[2], formGroups[3]], // notes and photo
      4: [], // preview step - no form groups
    };

    // Hide all groups initially except first step
    formGroups.forEach((group, index) => {
      if (!stepGroups[0].includes(group)) {
        group.style.display = 'none';
        group.classList.add('form-step');
      } else {
        group.classList.add('form-step', 'active-step');
      }
    });

    // Create navigation buttons
    this.createStepNavigation();
  }

  createStepNavigation() {
    const navContainer = document.createElement('div');
    navContainer.className = 'step-navigation';
    navContainer.innerHTML = `
      <button type="button" class="step-btn step-prev" disabled>
        ← Previous
      </button>
      <button type="button" class="step-btn step-next">
        Next →
      </button>
      <button type="submit" class="step-btn step-submit" style="display: none;">
        Add Marker
      </button>
    `;

    // Insert before the original submit button
    const originalSubmit = this.form.querySelector('button[type="submit"]');
    if (originalSubmit) {
      originalSubmit.style.display = 'none';
      this.form.insertBefore(navContainer, originalSubmit);
    }

    this.bindNavigationEvents(navContainer);
  }

  bindNavigationEvents(navContainer) {
    const prevBtn = navContainer.querySelector('.step-prev');
    const nextBtn = navContainer.querySelector('.step-next');
    const submitBtn = navContainer.querySelector('.step-submit');

    nextBtn.addEventListener('click', () => this.nextStep());
    prevBtn.addEventListener('click', () => this.prevStep());

    // Validation on step change
    this.form.addEventListener('change', () => {
      this.updatePreview();
      this.validateCurrentStep();
    });
  }

  bindPreviewEvents() {
    const toggle = this.preview.querySelector('.preview-toggle');
    const content = this.preview.querySelector('.preview-content');

    toggle.addEventListener('click', () => {
      const isCollapsed = content.classList.contains('collapsed');
      content.classList.toggle('collapsed');
      toggle.textContent = isCollapsed ? '👁️' : '👁️‍🗨️';

      // Save preference
      localStorage.setItem('formPreviewCollapsed', !isCollapsed);
    });

    // Load saved state
    const savedState = localStorage.getItem('formPreviewCollapsed');
    if (savedState === 'true') {
      content.classList.add('collapsed');
      toggle.textContent = '👁️‍🗨️';
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      if (this.validateCurrentStep()) {
        this.collectStepData();
        this.currentStep++;
        this.updateStepVisibility();
        this.updateProgress();
        this.updatePreview();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepVisibility();
      this.updateProgress();
    }
  }

  updateStepVisibility() {
    const formGroups = this.form.querySelectorAll('.form-group');
    const stepGroups = {
      0: [0], // type
      1: [1], // status
      2: [4, 5], // location controls
      3: [2, 3], // notes and photo
      4: [], // preview step
    };

    // Hide all groups
    formGroups.forEach((group, index) => {
      group.style.display = 'none';
      group.classList.remove('active-step');
    });

    // Show current step groups
    const currentGroups = stepGroups[this.currentStep] || [];
    currentGroups.forEach((index) => {
      if (formGroups[index]) {
        formGroups[index].style.display = 'block';
        formGroups[index].classList.add('active-step');
      }
    });

    // Update navigation buttons
    const prevBtn = this.form.querySelector('.step-prev');
    const nextBtn = this.form.querySelector('.step-next');
    const submitBtn = this.form.querySelector('.step-submit');

    prevBtn.disabled = this.currentStep === 0;

    if (this.currentStep === this.steps.length - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'block';
      submitBtn.style.display = 'none';
    }

    // Focus first input in current step
    setTimeout(() => {
      const firstInput = this.form.querySelector(
        '.active-step input, .active-step select, .active-step textarea'
      );
      if (firstInput) firstInput.focus();
    }, 100);
  }

  updateProgress() {
    const progressFill = this.form.querySelector('.progress-fill');
    const stepIndicators = this.form.querySelectorAll('.step-indicator');

    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    progressFill.style.width = `${progress}%`;

    stepIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentStep);
      indicator.classList.toggle('completed', index < this.currentStep);
    });
  }

  validateCurrentStep() {
    const currentStepData = this.getCurrentStepData();

    switch (this.currentStep) {
      case 0: // type
        return currentStepData.type && currentStepData.type !== '';
      case 1: // status
        return currentStepData.status && currentStepData.status !== '';
      case 2: // location
        return currentStepData.lat && currentStepData.lng;
      case 3: // details (optional)
        return true;
      case 4: // preview
        return true;
      default:
        return true;
    }
  }

  getCurrentStepData() {
    const form = this.form;
    return {
      type: form.querySelector('[name="type"]')?.value,
      status: form.querySelector('[name="status"]')?.value,
      lat: form.querySelector('[name="lat"]')?.value,
      lng: form.querySelector('[name="lng"]')?.value,
      notes: form.querySelector('[name="notes"]')?.value,
      photo: form.querySelector('[name="photo"]')?.files[0],
    };
  }

  collectStepData() {
    this.formData = { ...this.formData, ...this.getCurrentStepData() };
  }

  updatePreview() {
    const data = this.getCurrentStepData();
    const previewType = this.preview.querySelector('.preview-type');
    const previewStatus = this.preview.querySelector('.preview-status');
    const previewLocation = this.preview.querySelector('.preview-location');
    const previewNotes = this.preview.querySelector('.preview-notes');
    const previewIcon = this.preview.querySelector('.marker-preview-icon');

    // Update type
    if (data.type) {
      const typeEmojis = {
        Hive: '🍯',
        Swarm: '🐝',
        Structure: '🏢',
        Tree: '🌳',
      };
      previewIcon.textContent = typeEmojis[data.type] || '🐝';
      previewType.textContent = data.type;
    } else {
      previewType.textContent = 'Select a type';
    }

    // Update status
    if (data.status) {
      const statusEmojis = {
        Unverified: '⚪',
        Active: '🟢',
        Checked: '🟡',
        Gone: '🔴',
        Removed: '🗑️',
      };
      previewStatus.textContent = `${statusEmojis[data.status] || '⚪'} ${data.status}`;
    } else {
      previewStatus.textContent = 'Select status';
    }

    // Update location
    if (data.lat && data.lng) {
      previewLocation.textContent = `📍 ${parseFloat(data.lat).toFixed(4)}, ${parseFloat(data.lng).toFixed(4)}`;
    } else {
      previewLocation.textContent = 'Select location';
    }

    // Update notes
    if (data.notes) {
      previewNotes.textContent = data.notes;
    } else {
      previewNotes.textContent = 'Add notes...';
    }

    // Add photo preview if exists
    this.updatePhotoPreview(data.photo);
  }

  updatePhotoPreview(photo) {
    let photoPreview = this.preview.querySelector('.preview-photo');

    if (photo) {
      if (!photoPreview) {
        photoPreview = document.createElement('div');
        photoPreview.className = 'preview-photo';
        this.preview
          .querySelector('.marker-preview-details')
          .appendChild(photoPreview);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.innerHTML = `
          <img src="${e.target.result}" alt="Photo preview">
          <span class="photo-label">📷 Photo attached</span>
        `;
      };
      reader.readAsDataURL(photo);
    } else if (photoPreview) {
      photoPreview.remove();
    }
  }

  // Method to handle form submission from the enhanced form
  handleSubmit(e) {
    e.preventDefault();

    if (this.currentStep !== this.steps.length - 1) {
      // If not on final step, go to next step instead of submitting
      this.nextStep();
      return false;
    }

    // Collect all data and proceed with normal submission
    this.collectStepData();
    return true; // Allow normal form submission
  }

  validateStepsUpTo(stepIndex) {
    for (let i = 0; i <= stepIndex; i++) {
      const previousStep = this.currentStep;
      this.currentStep = i;
      if (!this.validateCurrentStep()) {
        this.currentStep = previousStep;
        return false;
      }
    }
    this.currentStep = stepIndex + 1;
    return true;
  }

  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
      this.updateStepVisibility();
      this.updateProgress();
      this.updatePreview();
    }
  }

  reset() {
    this.currentStep = 0;
    this.formData = {};
    this.updateStepVisibility();
    this.updateProgress();
    this.updatePreview();
  }
}
