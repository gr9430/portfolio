/**
 * What we know about you - Surveillance Poetry Widget
 * Client-side only tracking visualization
 * No data transmission - everything stays local
 */

class WWKAYWidget {
  constructor() {
    this.poem = this.loadPoem();
    this.currentStanza = null;
    this.pageStartTime = Date.now();
    this.lastMouseActivity = Date.now();
    this.scrollDepth = 0;
    this.rotationInterval = null;
    this.currentRotationIndex = 0;
    this.isExpanded = false;
    this.privacyTools = [];
    this.privacyToolIndex = 0;
    this.privacyToolInterval = null;
    this.detectedTools = {};

    // Behavioral tracking
    this.keystrokes = 0;
    this.mouseClicks = 0;
    this.tabSwitches = 0;
    this.copyEvents = 0;
    this.pasteEvents = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createWidget();
    this.startNewStanza();
    this.loadPrivacyTools();
    this.startRotation();
  }

  setupEventListeners() {
    // Mouse activity tracking
    document.addEventListener('mousemove', () => {
      this.lastMouseActivity = Date.now();
    });

    // Scroll depth tracking
    window.addEventListener('scroll', () => {
      this.updateScrollDepth();
    });

    // Page visibility change (handle tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.lastMouseActivity = Date.now();
      }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.collapse();
      }
    });

    // Save poem before page unload
    window.addEventListener('beforeunload', () => {
      this.finalizeCurrentStanza();
      this.savePoem();
    });
  }

  createWidget() {
    // Main widget container
    this.widget = document.createElement('div');
    this.widget.id = 'wwkay-widget';
    this.widget.innerHTML = `
      <div id="wwkay-collapsed" class="wwkay-collapsed">
        <div class="wwkay-rotating-text" id="wwkay-rotating"></div>
      </div>
      <div id="wwkay-expanded" class="wwkay-expanded" style="display: none;">
        <div class="wwkay-header">
          <h3>What we know about you</h3>
          <button class="wwkay-close" id="wwkay-close">×</button>
        </div>
        <div class="wwkay-poem-container" id="wwkay-poem"></div>
        <div class="wwkay-tools" id="wwkay-tools"></div>
        <div class="wwkay-button-container">
          <button class="wwkay-download" id="wwkay-download">↓ SAVE POEM AS .TXT</button>
          <button class="wwkay-context" id="wwkay-context">FULL CONTEXT</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.widget);
    this.setupWidgetEvents();
  }

  setupWidgetEvents() {
    const collapsed = document.getElementById('wwkay-collapsed');
    const close = document.getElementById('wwkay-close');
    const download = document.getElementById('wwkay-download');
    const context = document.getElementById('wwkay-context');

    collapsed.addEventListener('click', () => this.expand());
    close.addEventListener('click', () => this.collapse());
    download.addEventListener('click', () => this.downloadPoem());
    context.addEventListener('click', () => this.openContext());

    // Hover effects for collapsed state
    collapsed.addEventListener('mouseenter', () => {
      if (!this.isExpanded) {
        this.pauseRotation();
        document.getElementById('wwkay-rotating').textContent = 'What we know about you';
        collapsed.classList.add('wwkay-hover');
      }
    });

    collapsed.addEventListener('mouseleave', () => {
      if (!this.isExpanded) {
        collapsed.classList.remove('wwkay-hover');
        this.startRotation();
      }
    });

    // Keyboard accessibility
    collapsed.setAttribute('tabindex', '0');
    collapsed.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.expand();
      }
    });
  }

  startNewStanza() {
    const pageName = this.getPageName();
    this.currentStanza = {
      pageName: pageName,
      startTime: Date.now(),
      data: {
        browser: this.getBrowserInfo(),
        viewport: this.getViewportSize(),
        referrer: this.getReferrer(),
        localStorage: this.getLocalStorageStatus(),
        scrollDepth: '0%',
        sessionTime: '0m 0s',
        mouseIdle: '0s',
        // Hardware fingerprinting
        cpu_cores: this.getCPUCores(),
        device_memory: this.getDeviceMemory(),
        screen_details: this.getScreenDetails(),
        pixel_ratio: this.getPixelRatio(),
        // Network & Location
        timezone: this.getTimezone(),
        language: this.getLanguage(),
        platform: this.getPlatform(),
        // Fingerprinting
        canvas_fingerprint: this.getCanvasFingerprint(),
        webgl_renderer: this.getWebGLInfo(),
        audio_signature: this.getAudioFingerprint(),
        // Advanced metrics
        touch_support: this.getTouchSupport(),
        connection_type: this.getConnectionType(),
        fonts_detected: this.getFontFingerprint(),
        // Behavioral tracking
        keystrokes: '0 keys',
        mouse_clicks: '0 clicks',
        copy_paste_events: '0 copy, 0 paste'
      }
    };

    // Start behavioral tracking
    this.trackBehavior();

    // Start real-time updates
    this.updateInterval = setInterval(() => {
      this.updateCurrentStanza();
    }, 1000);
  }

  updateCurrentStanza() {
    if (!this.currentStanza) return;

    this.currentStanza.data.sessionTime = this.formatSessionTime();
    this.currentStanza.data.scrollDepth = Math.round(this.scrollDepth) + '%';
    this.currentStanza.data.mouseIdle = this.getMouseIdleTime();

    // Update behavioral tracking
    this.currentStanza.data.keystrokes = `${this.keystrokes} keys`;
    this.currentStanza.data.mouse_clicks = `${this.mouseClicks} clicks`;
    this.currentStanza.data.copy_paste_events = `${this.copyEvents} copy, ${this.pasteEvents} paste`;

    // Update displayed poem if expanded
    if (this.isExpanded) {
      this.updatePoemDisplay();
    }
  }

  trackBehavior() {
    // Track keystrokes
    document.addEventListener('keydown', () => {
      this.keystrokes++;
    });

    // Track mouse clicks
    document.addEventListener('click', () => {
      this.mouseClicks++;
    });

    // Track copy/paste events
    document.addEventListener('copy', () => {
      this.copyEvents++;
    });

    document.addEventListener('paste', () => {
      this.pasteEvents++;
    });

    // Track tab switches / window focus changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.tabSwitches++;
      }
    });
  }

  finalizeCurrentStanza() {
    if (!this.currentStanza) return;

    this.updateCurrentStanza();
    this.poem.push({ ...this.currentStanza });

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Data collection methods
  getPageName() {
    const title = document.title;
    if (title) return title;

    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(p => p);
    return parts.length > 0 ? parts[parts.length - 1] : 'Home';
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Browser detection
    if (ua.includes('Firefox/')) {
      browser = 'Firefox/' + ua.match(/Firefox\/([0-9.]+)/)?.[1];
    } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
      browser = 'Chrome/' + ua.match(/Chrome\/([0-9.]+)/)?.[1];
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browser = 'Safari/' + ua.match(/Version\/([0-9.]+)/)?.[1];
    } else if (ua.includes('Edg/')) {
      browser = 'Edge/' + ua.match(/Edg\/([0-9.]+)/)?.[1];
    }

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return `${browser} on ${os}`;
  }

  getViewportSize() {
    return `${window.innerWidth}×${window.innerHeight}`;
  }

  getReferrer() {
    return document.referrer || '(direct)';
  }

  getLocalStorageStatus() {
    try {
      localStorage.setItem('wwkay-test', 'test');
      localStorage.removeItem('wwkay-test');
      return 'enabled';
    } catch (e) {
      return 'disabled';
    }
  }

  updateScrollDepth() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.scrollDepth = Math.max(
      this.scrollDepth,
      ((scrollTop + windowHeight) / documentHeight) * 100
    );
  }

  formatSessionTime() {
    const seconds = Math.floor((Date.now() - this.currentStanza.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  getMouseIdleTime() {
    const idleSeconds = Math.floor((Date.now() - this.lastMouseActivity) / 1000);
    return idleSeconds + 's';
  }

  // === ADVANCED FINGERPRINTING METHODS ===

  getCPUCores() {
    try {
      return navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'not available';
    } catch (e) {
      return 'not available';
    }
  }

  getDeviceMemory() {
    try {
      return navigator.deviceMemory ? `${navigator.deviceMemory}GB RAM` : 'not available';
    } catch (e) {
      return 'not available';
    }
  }

  getScreenDetails() {
    try {
      const screen = window.screen;
      return `${screen.width}×${screen.height} (${screen.colorDepth}-bit)`;
    } catch (e) {
      return 'not available';
    }
  }

  getPixelRatio() {
    try {
      return `${window.devicePixelRatio || 1}x pixel ratio`;
    } catch (e) {
      return 'not available';
    }
  }

  getTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset <= 0 ? '+' : '-';
      return `${tz} (UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`;
    } catch (e) {
      return 'not available';
    }
  }

  getLanguage() {
    try {
      return `${navigator.language} (${navigator.languages ? navigator.languages.join(', ') : 'not available'})`;
    } catch (e) {
      return 'not available';
    }
  }

  getPlatform() {
    try {
      return navigator.platform || 'not available';
    } catch (e) {
      return 'not available';
    }
  }

  getTouchSupport() {
    try {
      return 'ontouchstart' in window ? `${navigator.maxTouchPoints || 'some'} touch points` : 'no touch';
    } catch (e) {
      return 'not available';
    }
  }

  getConnectionType() {
    try {
      if ('connection' in navigator) {
        const conn = navigator.connection;
        return `${conn.effectiveType || 'unknown'} (${conn.downlink || '?'} Mbps)`;
      }
      return 'not available';
    } catch (e) {
      return 'not available';
    }
  }

  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'your browser is blocking this';

      canvas.width = 200;
      canvas.height = 50;

      // Draw unique pattern for fingerprinting
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Surveillance Poetry', 2, 2);
      ctx.fillStyle = 'rgba(122, 6, 97, 0.5)';
      ctx.fillRect(50, 10, 100, 30);

      const dataURL = canvas.toDataURL();

      // Check if canvas is blank (fingerprinting blocked)
      if (dataURL === 'data:,' || dataURL.length < 100) {
        return 'your browser is blocking this';
      }

      // Get short hash of canvas data
      let hash = 0;
      for (let i = 0; i < dataURL.length; i++) {
        const char = dataURL.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return `canvas_${Math.abs(hash).toString(16).substr(0, 8)}`;
    } catch (e) {
      return 'your browser is blocking this';
    }
  }

  getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) return 'your browser is blocking this';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return renderer || 'your browser is masking this';
      }

      return 'your browser is masking this';
    } catch (e) {
      return 'your browser is blocking this';
    }
  }

  getAudioFingerprint() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return 'your browser is blocking this';

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0; // Silent

      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      // Generate fingerprint from audio context properties
      const fingerprint = [
        audioContext.sampleRate,
        audioContext.baseLatency || 0,
        analyser.fftSize,
        analyser.frequencyBinCount
      ].join('_');

      oscillator.stop();
      audioContext.close();

      return `audio_${fingerprint.split('_').map(x => parseInt(x) || 0).reduce((a, b) => a + b, 0).toString(16).substr(0, 8)}`;
    } catch (e) {
      return 'your browser is blocking this';
    }
  }

  getFontFingerprint() {
    try {
      // Test for common fonts that reveal system info
      const testFonts = [
        'Arial', 'Times', 'Times New Roman', 'Courier New', 'Courier',
        'Verdana', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
        'Arial Black', 'Tahoma', 'Helvetica', 'Palatino', 'Garamond',
        'Bookman', 'Avant Garde', 'serif', 'sans-serif', 'monospace',
        // System-specific fonts that reveal OS
        'Apple Symbols', 'Menlo', 'Monaco', // Mac
        'Segoe UI', 'Consolas', 'Calibri', // Windows
        'Ubuntu', 'Liberation Sans', 'DejaVu Sans' // Linux
      ];

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const testString = 'mmmmmmmmli'; // Characters that vary between fonts
      const detectedFonts = [];

      // Baseline measurement with default font
      ctx.font = '12px serif';
      const baseline = ctx.measureText(testString).width;

      for (const font of testFonts) {
        ctx.font = `12px ${font}, serif`;
        const width = ctx.measureText(testString).width;

        // If width differs significantly from baseline, font is likely available
        if (Math.abs(width - baseline) > 0.1) {
          detectedFonts.push(font);
        }
      }

      if (detectedFonts.length === 0) {
        return 'your browser is blocking this';
      }
      return `${detectedFonts.length} fonts (${detectedFonts.slice(0, 3).join(', ')}...)`;
    } catch (e) {
      return 'your browser is blocking this';
    }
  }

  // === PRIVACY TOOL DETECTION ===
  // Only detect tools where we have high confidence

  detectPrivacyTools() {
    return {
      ublock: this.detectUBlockOrigin(),
      brave: this.detectBrave(),
      firefox: this.detectFirefox(),
      tor: this.detectTorBrowser()
    };
  }

  detectUBlockOrigin() {
    // Create a bait element that ad blockers typically hide
    try {
      const bait = document.createElement('div');
      bait.className = 'ad-banner adsbox ad-placeholder';
      bait.style.cssText = 'position:absolute;top:-9999px;left:-9999px;height:1px;width:1px;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      // Check after a brief delay if element was hidden/removed
      const isBlocked = bait.offsetHeight === 0 ||
                        bait.offsetParent === null ||
                        window.getComputedStyle(bait).display === 'none';

      document.body.removeChild(bait);
      return isBlocked;
    } catch (e) {
      return false;
    }
  }

  detectBrave() {
    // Brave exposes navigator.brave API
    try {
      return navigator.brave !== undefined && typeof navigator.brave.isBrave === 'function';
    } catch (e) {
      return false;
    }
  }

  detectFirefox() {
    // Check user agent for Firefox
    try {
      return navigator.userAgent.includes('Firefox/');
    } catch (e) {
      return false;
    }
  }

  detectTorBrowser() {
    // Tor Browser has specific characteristics:
    // 1. User agent often says Firefox but with specific patterns
    // 2. Timezone is UTC
    // 3. Screen dimensions are standardized
    // 4. Many APIs return spoofed values
    try {
      const ua = navigator.userAgent;
      const isTorUA = ua.includes('Firefox/') && (
        // Tor Browser spoofs to specific Firefox ESR versions
        ua.includes('Windows NT 10.0') || ua.includes('Windows NT 6.1')
      );

      // Tor Browser forces timezone to UTC
      const isUTC = new Date().getTimezoneOffset() === 0;

      // Tor Browser uses standard window sizes (common: 1000x900 inner)
      const hasStandardSize = window.innerWidth % 100 === 0 && window.innerHeight % 100 === 0;

      // High confidence only if multiple signals present
      return isTorUA && isUTC && hasStandardSize;
    } catch (e) {
      return false;
    }
  }

  // Widget display methods
  startRotation() {
    if (this.rotationInterval) clearInterval(this.rotationInterval);

    this.rotationInterval = setInterval(() => {
      if (!this.isExpanded) {
        this.rotateDisplayText();
      }
    }, 2500);

    // Initial display - always show something
    this.rotateDisplayText();
  }

  pauseRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  rotateDisplayText() {
    if (!this.currentStanza) {
      // Show initialization message if no stanza yet
      const rotatingElement = document.getElementById('wwkay-rotating');
      if (rotatingElement) {
        rotatingElement.textContent = 'initializing surveillance...';
      }
      return;
    }

    const data = this.currentStanza.data;
    const lines = [
      `browser: ${data.browser}`,
      `viewport: ${data.viewport}`,
      `cpu_cores: ${data.cpu_cores}`,
      `device_memory: ${data.device_memory}`,
      `screen_details: ${data.screen_details}`,
      `timezone: ${data.timezone}`,
      `language: ${data.language}`,
      `canvas_fingerprint: ${data.canvas_fingerprint}`,
      `webgl_renderer: ${data.webgl_renderer}`,
      `audio_signature: ${data.audio_signature}`,
      `fonts_detected: ${data.fonts_detected}`,
      `touch_support: ${data.touch_support}`,
      `connection_type: ${data.connection_type}`,
      `keystrokes: ${data.keystrokes}`,
      `mouse_clicks: ${data.mouse_clicks}`,
      `copy_paste_events: ${data.copy_paste_events}`,
      `scroll_depth: ${data.scrollDepth}`,
      `session: ${data.sessionTime}`,
      `mouse_idle: ${data.mouseIdle}`,
      `localStorage: ${data.localStorage}`
    ];

    const rotatingElement = document.getElementById('wwkay-rotating');
    if (rotatingElement) {
      rotatingElement.style.opacity = '0';

      setTimeout(() => {
        rotatingElement.textContent = lines[this.currentRotationIndex];
        rotatingElement.style.opacity = '1';
        this.currentRotationIndex = (this.currentRotationIndex + 1) % lines.length;
      }, 150);
    }
  }

  expand() {
    this.isExpanded = true;
    this.pauseRotation();

    document.getElementById('wwkay-collapsed').style.display = 'none';
    document.getElementById('wwkay-expanded').style.display = 'block';

    this.updatePoemDisplay();
    this.startPrivacyToolRotation();

    // Focus close button for accessibility
    document.getElementById('wwkay-close').focus();
  }


  collapse() {
    this.isExpanded = false;

    document.getElementById('wwkay-expanded').style.display = 'none';
    const collapsed = document.getElementById('wwkay-collapsed');
    collapsed.style.display = 'block';

    // Reset any animation-related styles that might affect text alignment
    collapsed.style.transform = '';
    collapsed.style.position = 'relative';

    this.stopPrivacyToolRotation();
    this.startRotation();
  }

  updatePoemDisplay() {
    const poemContainer = document.getElementById('wwkay-poem');
    if (!poemContainer) return;

    let poemText = '';

    // Add completed stanzas
    for (const stanza of this.poem) {
      poemText += this.formatStanza(stanza) + '\n\n';
    }

    // Add current stanza (live updating)
    if (this.currentStanza) {
      poemText += this.formatStanza(this.currentStanza);
    }

    if (poemText.trim() === '') {
      poemText = 'Your surveillance poem is just beginning...\n\nBrowse different pages on this site to see how tracking\ncollects data about your browsing patterns.\n\nThe poem will accumulate stanzas as you navigate.';
    }

    poemContainer.innerHTML = `<pre>${poemText}</pre>`;
    poemContainer.scrollTop = poemContainer.scrollHeight;
  }

  formatStanza(stanza) {
    const sessionTime = stanza.startTime === this.currentStanza?.startTime
      ? this.formatSessionTime()
      : stanza.data.sessionTime;

    let formatted = `// ${stanza.pageName} — ${sessionTime}\n`;

    // Select most impactful metrics for poem display (avoid overwhelming)
    const displayFields = [
      'browser',
      'viewport',
      'cpu_cores',
      'device_memory',
      'screen_details',
      'timezone',
      'canvas_fingerprint',
      'webgl_renderer',
      'audio_signature',
      'fonts_detected',
      'touch_support',
      'connection_type',
      'keystrokes',
      'mouse_clicks',
      'copy_paste_events',
      'scrollDepth',
      'mouseIdle',
      'localStorage'
    ];

    for (const field of displayFields) {
      if (stanza.data[field] && stanza.data[field] !== 'unknown') {
        formatted += `${field}: ${stanza.data[field]}\n`;
      }
    }

    return formatted.trim();
  }

  // Privacy tools functionality
  async loadPrivacyTools() {
    try {
      const response = await fetch('/elit/wwkay/privacy-tools.json');
      this.privacyTools = await response.json();
    } catch (error) {
      console.warn('Could not load privacy tools:', error);
      this.privacyTools = [
        { name: 'Privacy Guides', url: 'https://privacyguides.org' }
      ];
    }

    // Run detection for tools that have detectKey
    this.detectedTools = this.detectPrivacyTools();
  }

  startPrivacyToolRotation() {
    if (this.privacyTools.length === 0) return;

    this.displayPrivacyTool();

    this.privacyToolInterval = setInterval(() => {
      this.displayPrivacyTool();
    }, 10000);
  }

  stopPrivacyToolRotation() {
    if (this.privacyToolInterval) {
      clearInterval(this.privacyToolInterval);
    }
  }

  displayPrivacyTool() {
    const toolsContainer = document.getElementById('wwkay-tools');
    if (!toolsContainer || this.privacyTools.length === 0) return;

    const tool = this.privacyTools[this.privacyToolIndex];

    // Check if this tool has detection and if user has it
    let statusText = '';
    if (tool.detectKey && this.detectedTools[tool.detectKey]) {
      statusText = ' <span class="wwkay-detected">(You have this. Nice.)</span>';
    }

    toolsContainer.innerHTML = `
      → Consider: <a href="${tool.url}" target="_blank" rel="noopener">${tool.name}</a>${statusText}
    `;

    this.privacyToolIndex = (this.privacyToolIndex + 1) % this.privacyTools.length;
  }

  // Context page functionality
  openContext() {
    window.location.href = '/elit/wwkay/';
  }

  // Download functionality
  downloadPoem() {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    const filename = `wwkay-${timestamp}.txt`;

    let poemContent = 'WHAT WE KNOW ABOUT YOU\n';
    poemContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Add completed stanzas
    for (const stanza of this.poem) {
      poemContent += this.formatStanza(stanza) + '\n\n';
    }

    // Add current stanza
    if (this.currentStanza) {
      poemContent += this.formatStanza(this.currentStanza) + '\n\n';
    }

    poemContent += '---\n';
    poemContent += 'This poem was generated client-side and reflects data your browser\n';
    poemContent += 'reveals during normal web usage. No data was transmitted.\n\n';
    poemContent += 'Privacy resources: privacyguides.org';

    const blob = new Blob([poemContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  // LocalStorage persistence
  savePoem() {
    try {
      localStorage.setItem('wwkay-poem', JSON.stringify(this.poem));
      localStorage.setItem('wwkay-expanded', this.isExpanded.toString());
    } catch (e) {
      console.warn('Could not save poem to localStorage:', e);
    }
  }

  loadPoem() {
    try {
      const saved = localStorage.getItem('wwkay-poem');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load poem from localStorage:', e);
      return [];
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new WWKAYWidget());
} else {
  new WWKAYWidget();
}