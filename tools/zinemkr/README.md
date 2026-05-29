# Ziner

A vanilla JavaScript single-page application for creating zines, designed for amateurs, students, and anyone interested in DIY publishing. Built with a tactile, cut-and-paste editorial aesthetic reminiscent of photocopied zines.

## Features

### Canvas & Layout
- **Half-letter page format**: 5.5" × 8.5" (528 × 816px display)
- **Print-safe margins**: 24px margin guides to prevent content cutoff
- **Multi-page support**: Add and remove pages with easy navigation
- **Paper texture aesthetic**: Cream background (#f8f8f0) for authentic zine feel

### Text Elements
- **Easy editing**: Double-click any text to edit inline
- **Font system**: 7 customizable font slots for local .woff2 fonts
- **Typography controls**: Size, color, bold, italic, alignment
- **Rotation**: Each element gets slight random rotation (-3° to +3°)

### Image Elements
- **Provided graphics**: 6 built-in SVG patterns (halftone, stripes, star, dots, "ZINE" text, torn paper)
- **Upload support**: Add your own images (PNG, JPG, GIF, SVG)
- **Filters**: Grayscale and high-contrast options
- **Accessibility**: Alt text support for screen readers

### Interaction
- **Drag & drop**: Move elements around the canvas with mouse or touch
- **Boundary constraints**: Elements automatically stay within canvas bounds
- **Properties panel**: Comprehensive controls for position, size, styling
- **Keyboard shortcuts**: Delete/Backspace to delete, Escape to deselect

### Quality & Accessibility
- **Real-time accessibility checker**: WCAG compliance testing
- **Contrast validation**: Automatic color contrast ratio calculations
- **Margin detection**: Warnings for content outside safe print area
- **Overlap detection**: Alerts for overlapping text that may be unreadable
- **Font size warnings**: Alerts for text that may be too small at print scale

### Export Options
- **Print**: Direct browser printing with proper 5.5" × 8.5" page setup
- **Digital preview**: Full-screen view of all pages for review

## Getting Started

### Basic Usage
1. **Add Text**: Click "Add Text" to create a new text element
2. **Edit Text**: Double-click any text element to edit its content
3. **Add Images**: Click "Add Image" to upload, or click gallery items for provided graphics
4. **Move Elements**: Click and drag elements to reposition them
5. **Style Elements**: Select an element to see styling options in the right panel
6. **Check Accessibility**: Review the accessibility panel for compliance issues
7. **Preview**: Click "Digital Preview" to see all pages
8. **Print**: Click "Print" for physical output

### Font System
The zine maker supports 7 local font slots. To add fonts:

1. Obtain .woff2 or .ttf font files from sources like:
   - [The League of Moveable Type](https://theleagueofmoveabletype.com) (independent foundry)
   - [Velvetyne](https://velvetyne.fr) (experimental French foundry)
   - [Font Squirrel](https://fontsquirrel.com) (curated free fonts)

2. Rename your font files to match the slots (use .woff2 for best performance, .ttf is also supported):
   - `slot1.woff2` or `slot1.ttf` - Typewriter fonts
   - `slot2.woff2` or `slot2.ttf` - Marker/Hand fonts
   - `slot3.woff2` or `slot3.ttf` - Pixel/Display fonts
   - `slot4.woff2` or `slot4.ttf` - Editorial Serif fonts
   - `slot5.woff2` or `slot5.ttf` - Monospace fonts
   - `slot6.woff2` or `slot6.ttf` - Bold Display fonts
   - `slot7.woff2` or `slot7.ttf` - Document fonts

3. Place files in the `/fonts/` directory

4. Refresh the tool - fonts will appear in the properties panel

### Recommended Fonts
- **Typewriter**: League Gothic (condensed impact)
- **Marker/Hand**: Chunk (ultra bold slab)
- **Editorial**: Junction (humanist sans)
- **Experimental**: Any Velvetyne release for avant-garde aesthetics

## Technical Specifications

### Canvas Dimensions
- **Display**: 528 × 816 pixels (96 DPI)
- **Print**: 5.5" × 8.5" with 0.25" margins
- **Guides**: 24px margin indicators (non-printing)

### Accessibility Standards
- **Contrast**: WCAG AA compliance (4.5:1 minimum)
- **Font size**: 12px minimum recommended
- **Alt text**: Required for all images
- **Safe margins**: Content must stay within guides

### Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: Touch-optimized drag and drop
- **Print**: CSS print media queries for accurate output

### File Format
- **Images**: PNG, JPG, GIF, SVG support
- **Fonts**: .woff2 format only
- **Export**: Browser print or digital preview

## Pedagogical Applications

### Composition Courses
- **Visual rhetoric**: Explore how layout affects meaning
- **Multimodal composition**: Combine text, image, and design
- **Publishing literacy**: Understand print constraints and accessibility
- **Revision practice**: Easy experimentation with layout and design

### Creative Writing
- **Chapbook creation**: Publish poetry or short fiction
- **Collaborative zines**: Student-authored content collections
- **Genre exploration**: Experiment with visual poetry and concrete texts

### Digital Literacy
- **No-code design**: Learn layout principles without complex software
- **Web standards**: Understand accessibility and inclusive design
- **Print vs. digital**: Explore medium-specific design considerations

## Troubleshooting

### Fonts Not Loading
- Ensure .woff2 or .ttf format (not .woff, .otf, or other formats)
- Check file names match exactly: slot1.woff2/slot1.ttf, slot2.woff2/slot2.ttf, etc.
- Verify files are in the `/fonts/` directory
- Refresh the browser after adding fonts

### Print Issues
- Use Chrome or Firefox for best print results
- Check print preview before printing
- Ensure content stays within margin guides
- Use high-contrast colors for better print quality

### Accessibility Warnings
- **Low contrast**: Choose darker text colors or lighter backgrounds
- **Small fonts**: Increase font size to 12px or larger
- **Missing alt text**: Add descriptions for all images
- **Overlapping elements**: Adjust positioning to avoid text overlap

## License & Credits

Built for educational and creative use. The tool itself is available under open-source principles.

**Recommended font sources provide open-source fonts under SIL Open Font License:**
- The League of Moveable Type: Original open-source type foundry
- Velvetyne: Libre license experimental fonts
- Font Squirrel: Curated genuinely free fonts

No external dependencies, CDNs, or tracking. All processing happens locally in your browser.

---

**Questions or issues?** This tool was built as part of an experimental approach to accessible zine-making technology for composition pedagogy.