# "Your Oppression: Our Aesthetic"

A critical examination of album art that aestheticizes human atrocities, built using design justice principles and inspired by Bill Drummond's Silent Protest work.

## Project Overview

This reveal.js slideshow project examines how album artwork has appropriated imagery of human suffering and oppression for aesthetic purposes. The presentation approaches this sensitive subject with restraint, respect, and comprehensive user controls.

## Design Philosophy

- **Silent Protest Aesthetic**: Minimal, respectful, restrained design that honors sensitive content
- **Design Justice**: Transparent methodology, user agency, harm reduction
- **Privacy-First**: All processing happens client-side, no tracking or data transmission
- **Accessibility-Centered**: Multiple alt-text levels, content warnings, user controls

## Features

### User Controls
- **Blur Overlays**: Automatic blur for sensitive content with user override
- **Content Warnings**: Clear warnings before sensitive slides
- **Keyboard Navigation**: Full keyboard accessibility
- **Individual Control**: Per-image blur toggle
- **Temporary Reveal**: Double-click for temporary image reveal

### Accessibility
- Multiple levels of alt-text (brief, detailed, contextual)
- Screen reader support with live announcements
- High contrast and reduced motion support
- Touch gesture support on mobile devices
- Comprehensive keyboard shortcuts

### Technical Implementation
- **Jekyll Integration**: Seamlessly integrates with existing portfolio site
- **Reveal.js Framework**: Professional slideshow presentation
- **Client-side Processing**: Privacy-respecting image analysis
- **Responsive Design**: Works across all device sizes

## File Structure

```
/presentations/oppression-aesthetic/
├── index.html                      # Main slideshow page
├── assets/
│   ├── js/
│   │   ├── reveal-config.js        # Reveal.js configuration
│   │   ├── image-processor.js      # Image analysis system
│   │   ├── content-manager.js      # Content loading
│   │   └── accessibility.js        # User controls & a11y
│   ├── css/
│   │   └── oppression-aesthetic.css # Custom styling
│   └── vendor/
│       └── reveal/                 # Reveal.js library
├── content/
│   ├── images/                     # Album artwork (to be added)
│   ├── metadata/
│   │   └── image-data.json         # Structured metadata
│   └── alt-text/                   # Generated descriptions
└── README.md                       # This file
```

## Usage

### Starting the Slideshow

1. Navigate to `/presentations/oppression-aesthetic/`
2. Read the content warning and project information
3. Click "I understand, proceed" to begin
4. Use arrow keys or on-screen controls to navigate

### Keyboard Shortcuts

- `→` / `←` - Navigate slides
- `B` - Toggle blur overlays globally
- `W` - Show content warnings
- `H` / `?` - Show keyboard help
- `ESC` - Exit overview/close modals
- `Enter` / `Space` - On images: toggle individual blur
- `R` - On blurred images: reveal temporarily

### Adding New Content

1. Add image files to `content/images/`
2. Update `content/metadata/image-data.json` with:
   - Image metadata and context
   - Sensitivity assessment
   - Content warnings
   - Source citations
3. The system will automatically generate alt-text and slides

## Metadata Format

Each image entry requires:

```json
{
  "id": "artist-album-year",
  "artist": "Artist Name",
  "album": "Album Title",
  "year": 1987,
  "visual_description": "Detailed visual description",
  "context": {
    "brief": "Brief contextual summary",
    "historical_period": "Historical context",
    "political_context": "Political background",
    "aesthetic_tradition": "Art historical connections",
    "critical_framework": "Academic analysis",
    "ethical_considerations": "Ethical implications"
  },
  "content_warnings": ["List of specific warnings"],
  "sensitivity_level": "low|moderate|high",
  "blur_default": true/false,
  "tags": ["relevant", "tags"],
  "sources": ["Academic citations and references"]
}
```

## Development

### Local Testing

1. Ensure Jekyll is running: `bundle exec jekyll serve`
2. Navigate to `http://localhost:4000/presentations/oppression-aesthetic/`
3. Test all accessibility features and user controls

### Adding Images

For class assignment completion:
1. Gather album artwork around the chosen theme
2. Use semantic filenames: `artist-album-year-context.jpg`
3. Generate appropriate alt-text using the image processor
4. Add comprehensive metadata with critical analysis

### Deployment

The project deploys automatically with Jekyll via GitHub Pages. No build process required beyond Jekyll's standard compilation.

## Ethical Considerations

This project handles sensitive content with respect:

- **Content Warnings**: Clear warnings before all sensitive material
- **User Agency**: Complete control over what users see and when
- **Academic Context**: Educational purpose with proper attribution
- **Privacy Respect**: No tracking, all processing client-side
- **Harm Reduction**: Blur overlays and content controls prevent re-traumatization

## Technical Requirements

- Modern web browser with JavaScript enabled
- No additional dependencies beyond Jekyll
- Works offline after initial load
- Accessible across all device types

## Credits

- **Framework**: [Reveal.js](https://revealjs.com/) by Hakim El Hattab
- **Inspiration**: Bill Drummond's Silent Protest (2002)
- **Philosophy**: Design Justice principles
- **Integration**: Glenn S. Ritchey III portfolio site aesthetic

## License

This project is created for educational purposes. Album artwork remains copyright of respective artists/labels. Academic analysis falls under fair use for educational criticism.

---

*This project embodies principles of design justice, user agency, and respectful engagement with sensitive content. It serves as both a critical examination of aesthetic appropriation and a demonstration of ethical digital presentation practices.*