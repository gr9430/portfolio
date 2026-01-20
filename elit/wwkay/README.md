# What you and I know about you

*A surveillance poetry widget that transforms browser tracking data into experimental literature.*

## Concept

"What you and I know about you" is a piece of experimental digital literature that makes visible the usually invisible mechanics of web surveillance. As users browse a website, the widget quietly collects the same data points that tracking systems typically gather—but instead of transmitting this information to servers, it transforms it into a live, accumulating poem.

The piece operates entirely client-side: no data leaves the user's browser. The poem grows with each page visited, creating a personalized verse that reflects the digital footprint generated through ordinary web usage. Users must actively engage with the widget to reveal the full extent of data collection, mirroring how surveillance operates largely in the background until brought into focus.

## Features

### Core Functionality
- **Real-time data collection**: Tracks browser info, viewport size, scroll patterns, session time, mouse activity
- **Live poem generation**: Creates code-comment style stanzas that update in real-time
- **Client-side only**: No data transmission—everything stays in the browser
- **Persistent memory**: LocalStorage preserves poem across page loads
- **Download capability**: Export complete poem as .txt file with timestamp

### Widget States
- **Collapsed**: Small widget showing rotating data lines in carousel format
- **Hover**: Color change with "CLICK FOR A PRIVACY POEM" prompt
- **Expanded**: Full poem view with privacy tool recommendations

### Accessibility
- Keyboard navigation support (Enter to expand, Escape to close)
- Focus indicators for screen readers
- Reduced motion support
- High contrast mode compatibility
- Mobile responsive design

## Installation

### Basic Integration
Copy the files to your website and include them on any page:

```html
<link rel="stylesheet" href="/path/to/wwkay.css">
<script src="/path/to/wwkay.js"></script>
```

The widget will automatically initialize when the page loads.

### File Structure
```
/elit/wwkay/
  index.md              # Landing page for the piece
  wwkay.js              # Main widget script
  wwkay.css             # Widget styles
  privacy-tools.json    # Privacy tool recommendations
  README.md             # Documentation
```

## Data Collection

The widget collects the following metrics per page visit:

- **Page name**: Extracted from document title or URL path
- **Session time**: Time spent on current page (mm:ss format)
- **Browser info**: Name, version, and operating system
- **Viewport dimensions**: Window width × height
- **Referrer**: Previous page or "(direct)" if none
- **Storage status**: Whether localStorage/cookies are enabled
- **Scroll depth**: Percentage of page height scrolled
- **Mouse idle time**: Seconds since last mouse movement

## Poetic Structure

Each page visit creates a new stanza in code-comment format:

```
// Home — 2m 14s
browser: Firefox/122.0 on Linux
viewport: 1920×1080
referrer: (direct)
localStorage: enabled
scroll_depth: 67%
mouse_idle: 34s
```

- **Header**: `// PageName — TimeOnPage`
- **Data fields**: `key: value` pairs
- **Real-time updates**: Current stanza updates live (scroll depth, idle time, session time)
- **Frozen history**: Previous stanzas remain unchanged

## Privacy Tools Integration

The widget includes rotating privacy tool recommendations in expanded view. Update `privacy-tools.json` to customize:

```json
[
  {
    "name": "Tool Name",
    "url": "https://example.com",
    "description": "Tool description"
  }
]
```

Tools rotate every 10 seconds in format: `→ Consider: Tool Name`

## Customization

### Colors
Edit CSS variables in `wwkay.css`:
- Background: `#3a3a3a` (light charcoal)
- Hover color: `#7A0661` (purple)
- Text: `#ffffff` (white)

### Timing
Modify rotation intervals in `wwkay.js`:
- Data rotation: `2500ms` (2.5 seconds)
- Privacy tool rotation: `10000ms` (10 seconds)
- Update interval: `1000ms` (1 second)

### Widget Size
Adjust dimensions in CSS:
- Collapsed: `200px × 40px`
- Expanded: `400px × 500px max`
- Mobile: Responsive scaling

## Technical Implementation

### Data Collection Methods
- **Browser detection**: User-Agent string parsing
- **Scroll tracking**: Window scroll event monitoring
- **Mouse activity**: Movement event timestamps
- **Session timing**: Page load timestamp comparison

### Storage Strategy
- **LocalStorage**: Persists poem data across sessions
- **JSON format**: Structured stanza storage
- **Graceful degradation**: Works without storage capabilities

### Performance Considerations
- **Debounced updates**: Prevents excessive DOM manipulation
- **Efficient rotation**: CSS transitions for smooth display
- **Memory management**: Automatic cleanup on page unload

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (ES6+ support required)
- **Mobile browsers**: iOS Safari, Android Chrome
- **Graceful degradation**: No errors if features unavailable
- **No dependencies**: Pure vanilla JavaScript

## Privacy Philosophy

This piece embodies principles of **transparency** and **data sovereignty**:

1. **Visibility**: Makes hidden surveillance visible through poetic transformation
2. **Client-side only**: No data transmission respects user privacy
3. **User control**: Poem can be cleared by refreshing or clearing localStorage
4. **Educational**: Demonstrates scope of typical browser tracking
5. **Empowerment**: Provides privacy tool recommendations

## Development Notes

### Code Structure
- **Class-based**: ES6 class with clear method separation
- **Event-driven**: DOM events trigger data updates
- **Modular design**: Easy to extend or modify behavior

### Error Handling
- **Try-catch blocks**: LocalStorage failures handled gracefully
- **Fallback values**: Default data if detection fails
- **Console warnings**: Non-intrusive error reporting

### Future Enhancements
- Additional tracking metrics (canvas fingerprinting, WebRTC leaks)
- Export formats (JSON, CSV)
- Custom poetry templates
- Integration with actual privacy tools
- Multi-language support

## License & Usage

This piece is designed for educational and artistic purposes. Feel free to adapt, modify, and deploy on websites with appropriate attribution. The widget serves as both a functional privacy education tool and a work of experimental digital literature.

## Contact & Attribution

Created by Glenn S. Ritchey III as part of experimental literature research. For questions about implementation, customization, or conceptual framework, see portfolio site documentation.

---

*"What we know about you" transforms the mechanics of surveillance into a form of resistance through visibility and poetry.*