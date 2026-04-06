/**
 * Accessibility Features for "Your Oppression: Our Aesthetic"
 * Implements user controls, blur overlays, and accessibility enhancements
 * Grounded in design justice principles and user agency
 */

class AccessibilityManager {
    constructor() {
        this.blurState = {
            enabled: true,
            userOverride: false,
            individualOverrides: new Map() // Track per-slide overrides
        };

        this.userPreferences = {
            showContentWarnings: true,
            announceSlideChanges: true,
            keyboardNavigation: true,
            highContrast: false,
            reducedMotion: false
        };

        this.contentWarnings = new Map(); // Track warnings per slide
        this.isInitialized = false;
    }

    /**
     * Initialize accessibility features
     */
    initialize() {
        if (this.isInitialized) return;

        console.log('Initializing accessibility features...');

        this.loadUserPreferences();
        this.setupBlurControls();
        this.setupKeyboardNavigation();
        this.setupContentWarnings();
        this.setupScreenReaderSupport();
        this.checkUserPreferences();
        this.setupTouchGestures();

        this.isInitialized = true;
        console.log('Accessibility features initialized');
    }

    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('oppression-aesthetic-accessibility');
            if (stored) {
                const prefs = JSON.parse(stored);
                Object.assign(this.userPreferences, prefs);
                Object.assign(this.blurState, prefs.blurState || {});
                console.log('Loaded accessibility preferences');
            }
        } catch (e) {
            console.log('Using default accessibility preferences');
        }
    }

    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            const data = {
                ...this.userPreferences,
                blurState: this.blurState
            };
            localStorage.setItem('oppression-aesthetic-accessibility', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save accessibility preferences');
        }
    }

    /**
     * Set up blur overlay controls
     */
    setupBlurControls() {
        // Global blur toggle
        const toggleButton = document.getElementById('toggle-blur');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleGlobalBlur());
            this.updateToggleButtonText(toggleButton);
        }

        // Individual image blur controls
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('slide-image')) {
                this.toggleIndividualBlur(event.target);
            }
        });

        // Double-click to reveal blurred images
        document.addEventListener('dblclick', (event) => {
            if (event.target.classList.contains('slide-image') && event.target.classList.contains('blurred')) {
                this.revealImage(event.target);
            }
        });

        // Apply initial blur state
        this.applyBlurSettings();
    }

    /**
     * Toggle global blur setting
     */
    toggleGlobalBlur() {
        this.blurState.enabled = !this.blurState.enabled;
        this.blurState.userOverride = true;
        this.applyBlurSettings();
        this.saveUserPreferences();

        // Update button text
        const toggleButton = document.getElementById('toggle-blur');
        if (toggleButton) {
            this.updateToggleButtonText(toggleButton);
        }

        // Announce to screen reader
        const state = this.blurState.enabled ? 'enabled' : 'disabled';
        this.announceToScreenReader(`Blur overlays ${state}`);

        console.log(`Global blur ${state}`);
    }

    /**
     * Update toggle button text
     */
    updateToggleButtonText(button) {
        const state = this.blurState.enabled ? 'Disable' : 'Enable';
        button.textContent = `${state} Blur Overlays`;
        button.setAttribute('aria-label', `${state} blur overlays for sensitive content`);
    }

    /**
     * Toggle blur for individual image
     */
    toggleIndividualBlur(imageElement) {
        const slideId = imageElement.getAttribute('data-slide-id');
        if (!slideId) return;

        const currentlyBlurred = imageElement.classList.contains('blurred');
        const newState = !currentlyBlurred;

        if (newState) {
            imageElement.classList.add('blurred');
        } else {
            imageElement.classList.remove('blurred');
        }

        // Store individual override
        this.blurState.individualOverrides.set(slideId, newState);
        this.saveUserPreferences();

        // Announce to screen reader
        const state = newState ? 'blurred' : 'revealed';
        this.announceToScreenReader(`Image ${state}`);

        console.log(`Individual blur ${state} for slide ${slideId}`);
    }

    /**
     * Temporarily reveal a blurred image
     */
    revealImage(imageElement, duration = 5000) {
        if (!imageElement.classList.contains('blurred')) return;

        imageElement.classList.add('temporarily-revealed');
        imageElement.style.filter = 'none';

        this.announceToScreenReader('Image temporarily revealed. Will re-blur automatically.');

        setTimeout(() => {
            imageElement.classList.remove('temporarily-revealed');
            imageElement.style.filter = '';
            this.announceToScreenReader('Image re-blurred');
        }, duration);
    }

    /**
     * Apply blur settings to all images
     */
    applyBlurSettings() {
        const images = document.querySelectorAll('.slide-image');

        images.forEach(img => {
            const slideId = img.getAttribute('data-slide-id');
            const slide = img.closest('section');
            const sensitivity = slide?.getAttribute('data-sensitivity');

            let shouldBlur = this.shouldImageBeBlurred(sensitivity, slideId);

            if (shouldBlur && !img.classList.contains('blurred')) {
                img.classList.add('blurred');
            } else if (!shouldBlur && img.classList.contains('blurred')) {
                img.classList.remove('blurred');
            }

            // Ensure images have proper alt text and accessibility attributes
            this.enhanceImageAccessibility(img);
        });
    }

    /**
     * Determine if an image should be blurred
     */
    shouldImageBeBlurred(sensitivity, slideId) {
        // Check individual override first
        if (this.blurState.individualOverrides.has(slideId)) {
            return this.blurState.individualOverrides.get(slideId);
        }

        // Check global setting
        if (!this.blurState.enabled) {
            return false;
        }

        // Apply sensitivity-based rules
        switch (sensitivity) {
            case 'high':
                return true;
            case 'moderate':
                return this.userPreferences.blurModerate !== false;
            case 'low':
            default:
                return false;
        }
    }

    /**
     * Enhance image accessibility
     */
    enhanceImageAccessibility(imageElement) {
        // Ensure alt text is present
        if (!imageElement.getAttribute('alt')) {
            const slideId = imageElement.getAttribute('data-slide-id');
            imageElement.setAttribute('alt', `Album artwork for slide ${slideId || 'unknown'}`);
        }

        // Add keyboard interaction
        if (!imageElement.hasAttribute('tabindex')) {
            imageElement.setAttribute('tabindex', '0');
        }

        // Add keyboard event listeners
        imageElement.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    this.toggleIndividualBlur(imageElement);
                    event.preventDefault();
                    break;
                case 'r':
                case 'R':
                    if (imageElement.classList.contains('blurred')) {
                        this.revealImage(imageElement);
                        event.preventDefault();
                    }
                    break;
            }
        });

        // Add focus indicators
        imageElement.addEventListener('focus', () => {
            imageElement.style.outline = '2px solid var(--primary-purple)';
            imageElement.style.outlineOffset = '2px';
        });

        imageElement.addEventListener('blur', () => {
            imageElement.style.outline = '';
            imageElement.style.outlineOffset = '';
        });
    }

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (!this.userPreferences.keyboardNavigation) return;

            // Don't interfere with form inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'b':
                case 'B':
                    if (!event.ctrlKey && !event.metaKey) {
                        this.toggleGlobalBlur();
                        event.preventDefault();
                    }
                    break;

                case 'w':
                case 'W':
                    if (!event.ctrlKey && !event.metaKey) {
                        this.showContentWarningsModal();
                        event.preventDefault();
                    }
                    break;

                case 'h':
                case 'H':
                    if (!event.ctrlKey && !event.metaKey) {
                        this.showKeyboardHelp();
                        event.preventDefault();
                    }
                    break;

                case 'Escape':
                    this.closeModals();
                    break;

                case '?':
                    this.showKeyboardHelp();
                    event.preventDefault();
                    break;
            }
        });
    }

    /**
     * Set up content warning system
     */
    setupContentWarnings() {
        // Scan slides for content warnings
        this.scanContentWarnings();

        // Set up warning button
        const warningButton = document.getElementById('show-warnings');
        if (warningButton) {
            warningButton.addEventListener('click', () => this.showContentWarningsModal());
        }
    }

    /**
     * Scan slides for content warnings
     */
    scanContentWarnings() {
        const slides = document.querySelectorAll('section[data-slide-id]');

        slides.forEach(slide => {
            const slideId = slide.getAttribute('data-slide-id');
            const warningElement = slide.querySelector('.slide-warning');
            const sensitivity = slide.getAttribute('data-sensitivity');

            if (warningElement || sensitivity !== 'low') {
                const warningText = warningElement?.textContent || `${sensitivity} sensitivity content`;
                this.contentWarnings.set(slideId, {
                    text: warningText,
                    sensitivity: sensitivity,
                    element: warningElement
                });
            }
        });

        console.log(`Found ${this.contentWarnings.size} slides with content warnings`);
    }

    /**
     * Show content warnings modal
     */
    showContentWarningsModal() {
        let modal = document.getElementById('content-warnings-modal');

        if (!modal) {
            modal = this.createContentWarningsModal();
            document.body.appendChild(modal);
        }

        modal.style.display = 'block';
        modal.focus();
        this.announceToScreenReader('Content warnings modal opened');
    }

    /**
     * Create content warnings modal
     */
    createContentWarningsModal() {
        const modal = document.createElement('div');
        modal.id = 'content-warnings-modal';
        modal.className = 'help-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'warnings-title');
        modal.setAttribute('tabindex', '-1');

        let warningsList = '';
        this.contentWarnings.forEach((warning, slideId) => {
            warningsList += `<li><strong>Slide ${slideId}:</strong> ${warning.text} (${warning.sensitivity} sensitivity)</li>`;
        });

        modal.innerHTML = `
            <div class="help-content">
                <h3 id="warnings-title">Content Warnings</h3>
                <p>This presentation contains the following sensitive content:</p>
                <ul>${warningsList || '<li>No specific content warnings identified</li>'}</ul>
                <p>You can use keyboard shortcuts to control blur overlays and navigate safely through the content.</p>
                <button onclick="window.accessibilityManager.closeContentWarningsModal()" autofocus>Close</button>
            </div>
        `;

        return modal;
    }

    /**
     * Close content warnings modal
     */
    closeContentWarningsModal() {
        const modal = document.getElementById('content-warnings-modal');
        if (modal) {
            modal.style.display = 'none';
            this.announceToScreenReader('Content warnings modal closed');
        }
    }

    /**
     * Show keyboard help modal
     */
    showKeyboardHelp() {
        const existingModal = document.getElementById('help-modal');
        if (existingModal) {
            existingModal.style.display = 'block';
            existingModal.focus();
        }
    }

    /**
     * Close all modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.help-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Set up screen reader support
     */
    setupScreenReaderSupport() {
        // Create screen reader announcer if it doesn't exist
        if (!document.getElementById('sr-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = `
                position: absolute !important;
                clip: rect(1px, 1px, 1px, 1px) !important;
                padding: 0 !important;
                border: 0 !important;
                height: 1px !important;
                width: 1px !important;
                overflow: hidden !important;
            `;
            document.body.appendChild(announcer);
        }

        // Announce slide changes
        if (window.Reveal) {
            Reveal.on('slidechanged', (event) => {
                if (this.userPreferences.announceSlideChanges) {
                    const slideId = event.currentSlide.getAttribute('data-slide-id');
                    const slideTitle = event.currentSlide.querySelector('h1, h2, h3')?.textContent;
                    const announcement = slideTitle ?
                        `Slide: ${slideTitle}` :
                        `Slide ${slideId || 'unknown'}`;

                    setTimeout(() => this.announceToScreenReader(announcement), 500);
                }
            });
        }
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }

    /**
     * Check and apply user system preferences
     */
    checkUserPreferences() {
        // Reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.userPreferences.reducedMotion = true;
            document.documentElement.style.setProperty('--transition-duration', '0s');
        }

        // High contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.userPreferences.highContrast = true;
            document.body.classList.add('high-contrast');
        }
    }

    /**
     * Set up touch gestures for mobile accessibility
     */
    setupTouchGestures() {
        let touchStartY = 0;
        let touchStartX = 0;

        document.addEventListener('touchstart', (event) => {
            touchStartY = event.touches[0].clientY;
            touchStartX = event.touches[0].clientX;
        });

        document.addEventListener('touchend', (event) => {
            const touchEndY = event.changedTouches[0].clientY;
            const touchEndX = event.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = touchStartX - touchEndX;

            // Vertical swipe on images to toggle blur
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                const target = event.target;
                if (target.classList.contains('slide-image')) {
                    this.toggleIndividualBlur(target);
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Get accessibility status report
     */
    getAccessibilityStatus() {
        return {
            blurState: this.blurState,
            userPreferences: this.userPreferences,
            contentWarnings: Array.from(this.contentWarnings.entries()),
            isInitialized: this.isInitialized
        };
    }

    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.blurState = {
            enabled: true,
            userOverride: false,
            individualOverrides: new Map()
        };

        this.userPreferences = {
            showContentWarnings: true,
            announceSlideChanges: true,
            keyboardNavigation: true,
            highContrast: false,
            reducedMotion: false
        };

        this.saveUserPreferences();
        this.applyBlurSettings();

        this.announceToScreenReader('Accessibility settings reset to defaults');
        console.log('Accessibility settings reset to defaults');
    }
}

// Global functions for backward compatibility
function toggleBlur() {
    if (window.accessibilityManager) {
        window.accessibilityManager.toggleGlobalBlur();
    }
}

function showContentWarnings() {
    if (window.accessibilityManager) {
        window.accessibilityManager.showContentWarningsModal();
    }
}

function showKeyboardHelp() {
    if (window.accessibilityManager) {
        window.accessibilityManager.showKeyboardHelp();
    } else {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

function hideKeyboardHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
} else if (typeof window !== 'undefined') {
    window.AccessibilityManager = AccessibilityManager;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.accessibilityManager = new AccessibilityManager();
        // Don't auto-initialize - wait for slideshow to start
    }
});