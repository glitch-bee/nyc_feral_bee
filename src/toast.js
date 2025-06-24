// Toast Notification System
export class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.createContainer();
  }

  createContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000, options = {}) {
    const toast = this.createToast(message, type, options);
    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-dismiss
    if (duration > 0) {
      this.setupAutoRemove(toast, duration);
    }

    return toast.id;
  }

  createToast(message, type, options) {
    const toast = document.createElement('div');
    const toastId =
      'toast-' + Date.now() + Math.random().toString(36).substr(2, 9);

    toast.id = toastId;
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close notification">×</button>
      ${options.showProgress ? '<div class="toast-progress"></div>' : ''}
    `;

    // Add event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toastId));

    toast.addEventListener('click', () => {
      if (options.onClick) options.onClick();
    });

    this.toasts.set(toastId, toast);
    return toast;
  }

  setupAutoRemove(toast, duration) {
    const progressBar = toast.querySelector('.toast-progress');

    if (progressBar) {
      progressBar.style.width = '100%';
      // Animate progress bar
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';
      });
    }

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  remove(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.classList.remove('show');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 250);
  }

  success(message, duration, options) {
    return this.show(message, 'success', duration, options);
  }

  error(message, duration, options) {
    return this.show(message, 'error', duration, options);
  }

  warning(message, duration, options) {
    return this.show(message, 'warning', duration, options);
  }

  info(message, duration, options) {
    return this.show(message, 'info', duration, options);
  }

  clear() {
    this.toasts.forEach((toast, id) => this.remove(id));
  }
}

// Create global toast instance
export const toast = new ToastManager();

// Loading state utilities
export function showLoading(element, text = 'Loading...') {
  if (!element) return;

  const originalContent = element.innerHTML;
  element.dataset.originalContent = originalContent;
  element.disabled = true;

  element.innerHTML = `
    <div class="spinner"></div>
    <span>${text}</span>
  `;

  return () => {
    element.innerHTML = originalContent;
    element.disabled = false;
    delete element.dataset.originalContent;
  };
}

export function createSkeleton(type = 'text', count = 1) {
  const container = document.createElement('div');

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;
    container.appendChild(skeleton);
  }

  return container;
}

export function showProgressBar(container, progress = 0) {
  let progressBar = container.querySelector('.progress-bar');

  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    container.appendChild(progressBar);
  }

  const fill = progressBar.querySelector('.progress-fill');
  fill.style.width = `${Math.max(0, Math.min(100, progress))}%`;

  return progressBar;
}
