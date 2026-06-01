/**
 * Reveal.js Configuration for "Your Oppression: Our Aesthetic"
 * Custom configuration aligned with Silent Protest aesthetic and design justice principles
 */

// Global configuration for the slideshow
const OppressionAestheticConfig = {
    // Silent Protest aesthetic preferences
    silentMode: false,
    showProcessInformation: true,
    respectfulPacing: true,

    // User accessibility preferences
    userPreferences: {
        blurSensitiveContent: true,
        showContentWarnings: true,
        useKeyboardNavigation: true,
        highContrast: false,
        reducedMotion: false
    },

    // Content sensitivity settings
    sensitivity: {
        autoBlurHigh: true,
        autoBlurModerate: true,
        showWarningsBeforeSlides: true,
        allowUserOverride: true
    }
};

// Initialize reveal.js with custom configuration
function initializeSlideshow() {
    console.log('initializeSlideshow() called - starting reveal.js initialization');

    try {
        console.log('About to call Reveal.initialize...');

        // Check DOM structure
        const revealContainer = document.querySelector('.reveal');
        const slidesContainer = document.querySelector('.slides');
        const sections = document.querySelectorAll('section');

        console.log('Reveal container found:', !!revealContainer);
        console.log('Slides container found:', !!slidesContainer);
        console.log('Section count:', sections.length);

        if (revealContainer) {
            console.log('Reveal container display style:', getComputedStyle(revealContainer).display);
        }

        // Try a minimal configuration first
        Reveal.initialize({
            controls: true,
            progress: true,
            center: false,
            hash: false,

            // Custom event handlers
            ready: function(event) {
                console.log('🎉 Reveal.js ready event fired!');
                console.log('Slideshow is working, now loading custom features...');
                initializeCustomFeatures();
                loadImageContent();
            }
        });

        console.log('Reveal.initialize() call completed');

        // Set a timeout to check if initialization hangs
        setTimeout(function() {
            console.log('Timeout check: Has reveal.js initialized?', Reveal.isReady());
        }, 3000);

    } catch (error) {
        console.error('Error initializing Reveal.js:', error);
        console.log('Attempting manual content loading...');
        // Try to load content manually if reveal.js fails
        initializeCustomFeatures();
        loadImageContent();
    }
}

// Initialize custom features after reveal.js loads
function initializeCustomFeatures() {
    console.log('Initializing custom features...');

    // Load user preferences from localStorage
    loadUserPreferences();

    // Initialize accessibility features
    initializeAccessibilityFeatures();

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();

    // Initialize image processing
    if (typeof ImageProcessor !== 'undefined') {
        window.imageProcessor = new ImageProcessor();
        console.log('Image processor initialized');
    }

    // Initialize content manager
    if (typeof ContentManager !== 'undefined') {
        window.contentManager = new ContentManager();
        console.log('Content manager initialized');
    }

    // Apply initial blur settings
    applyBlurSettings();
}

// Handle slide transitions
function handleSlideChange(event) {
    const currentSlide = event.currentSlide;
    const slideId = currentSlide.getAttribute('data-slide-id');
    const sensitivity = currentSlide.getAttribute('data-sensitivity');

    // Log slide progression (for analytics/debugging, not tracking)
    console.log(`Slide changed: ${slideId || 'unknown'}, sensitivity: ${sensitivity || 'none'}`);

    // Update browser hash for bookmarking
    if (slideId) {
        history.replaceState(null, null, `#${slideId}`);
    }

    // Handle content warnings for sensitive slides
    if (sensitivity === 'high' && OppressionAestheticConfig.sensitivity.showWarningsBeforeSlides) {
        showSlideContentWarning(currentSlide);
    }

    // Ensure proper focus for accessibility
    currentSlide.focus();
}

// Show content warning for sensitive slides
function showSlideContentWarning(slide) {
    const warningElement = slide.querySelector('.slide-warning');
    if (warningElement && !warningElement.classList.contains('acknowledged')) {
        // Highlight the warning briefly
        warningElement.style.animation = 'pulse 2s ease-in-out';
        setTimeout(() => {
            warningElement.style.animation = '';
            warningElement.classList.add('acknowledged');
        }, 2000);
    }
}

// Load and apply user preferences
function loadUserPreferences() {
    try {
        const stored = localStorage.getItem('oppression-aesthetic-prefs');
        if (stored) {
            const prefs = JSON.parse(stored);
            Object.assign(OppressionAestheticConfig.userPreferences, prefs);
            console.log('Loaded user preferences', prefs);
        }
    } catch (e) {
        console.log('No stored preferences found, using defaults');
    }
}

// Save user preferences
function saveUserPreferences() {
    try {
        localStorage.setItem('oppression-aesthetic-prefs',
            JSON.stringify(OppressionAestheticConfig.userPreferences));
        console.log('User preferences saved');
    } catch (e) {
        console.warn('Could not save user preferences', e);
    }
}

// Initialize accessibility features
function initializeAccessibilityFeatures() {
    // Check for user's motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        OppressionAestheticConfig.userPreferences.reducedMotion = true;
        document.documentElement.style.setProperty('--animation-duration', '0s');
    }

    // Check for high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        OppressionAestheticConfig.userPreferences.highContrast = true;
        document.body.classList.add('high-contrast');
    }

    // Set up screen reader announcements
    setupScreenReaderSupport();
}

// Set up screen reader support
function setupScreenReaderSupport() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
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
    window.screenReaderAnnouncer = announcer;
}

// Announce to screen readers
function announceToScreenReader(message) {
    if (window.screenReaderAnnouncer) {
        window.screenReaderAnnouncer.textContent = message;
    }
}

// Set up additional keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Respect user's keyboard navigation preference
        if (!OppressionAestheticConfig.userPreferences.useKeyboardNavigation) {
            return;
        }

        switch (event.key) {
            case 'b':
            case 'B':
                // Toggle blur overlays
                toggleBlur();
                event.preventDefault();
                break;

            case 'w':
            case 'W':
                // Show content warnings
                showContentWarnings();
                event.preventDefault();
                break;

            case 'h':
            case 'H':
                // Show help
                if (!event.ctrlKey && !event.metaKey) {
                    showKeyboardHelp();
                    event.preventDefault();
                }
                break;

            case 'Escape':
                // Close modals
                hideKeyboardHelp();
                break;
        }
    });
}

// Apply blur settings to all images
function applyBlurSettings() {
    const images = document.querySelectorAll('.slide-image');
    images.forEach(img => {
        const slide = img.closest('section');
        const sensitivity = slide?.getAttribute('data-sensitivity');
        const shouldBlur = determineBlurState(sensitivity);

        if (shouldBlur && !img.classList.contains('blurred')) {
            img.classList.add('blurred');
        } else if (!shouldBlur && img.classList.contains('blurred')) {
            img.classList.remove('blurred');
        }
    });
}

// Determine if an image should be blurred based on sensitivity and user preferences
function determineBlurState(sensitivity) {
    if (!OppressionAestheticConfig.userPreferences.blurSensitiveContent) {
        return false;
    }

    switch (sensitivity) {
        case 'high':
            return OppressionAestheticConfig.sensitivity.autoBlurHigh;
        case 'moderate':
            return OppressionAestheticConfig.sensitivity.autoBlurModerate;
        default:
            return false;
    }
}

// Load image content dynamically
function loadImageContent() {
    console.log('Loading image content...');
    console.log('Content manager available:', !!window.contentManager);
    console.log('Image processor available:', !!window.imageProcessor);

    if (window.contentManager) {
        // Initialize content manager with image processor
        if (window.imageProcessor) {
            window.contentManager.initialize(window.imageProcessor);
        }

        window.contentManager.loadContent().then(() => {
            console.log('Image content loaded successfully');
            console.log('Processed content items:', window.contentManager.processedContent.length);
            applyBlurSettings();
        }).catch(error => {
            console.error('Could not load image content:', error);
            console.log('Falling back to demo content...');
        });
    } else {
        console.error('Content manager not available - cannot load image content');
    }
}

// Export configuration object for use in other modules
if (typeof window !== 'undefined') {
    window.OppressionAestheticConfig = OppressionAestheticConfig;
    window.initializeSlideshow = initializeSlideshow;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Don't auto-initialize - wait for user to start slideshow
    console.log('Reveal.js configuration loaded, waiting for user to start slideshow');
});