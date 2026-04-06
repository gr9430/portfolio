/**
 * Content Manager for "Your Oppression: Our Aesthetic"
 * Handles loading, organizing, and managing slideshow content
 * Privacy-first approach with client-side processing
 */

class ContentManager {
    constructor() {
        this.metadata = [];
        this.processedContent = [];
        this.loadingState = 'idle'; // 'idle', 'loading', 'loaded', 'error'
        this.imageProcessor = null;
    }

    /**
     * Initialize content manager with image processor
     */
    initialize(imageProcessor = null) {
        this.imageProcessor = imageProcessor || window.imageProcessor || new ImageProcessor();
        console.log('Content manager initialized');
    }

    /**
     * Load content metadata from JSON file
     */
    async loadContent() {
        this.loadingState = 'loading';

        try {
            // Load image metadata from JSON file
            const metadataResponse = await fetch('/presentations/oppression-aesthetic/content/metadata/image-data.json');

            if (!metadataResponse.ok) {
                throw new Error(`Failed to load metadata: ${metadataResponse.status}`);
            }

            const data = await metadataResponse.json();
            this.metadata = data.images || [];

            // Transform metadata to match image processor expectations
            const transformedMetadata = this.transformMetadata(this.metadata);

            // Process metadata with image processor
            if (this.imageProcessor) {
                this.processedContent = this.imageProcessor.processImageBatch(transformedMetadata);
            } else {
                this.processedContent = transformedMetadata;
            }

            this.loadingState = 'loaded';
            console.log(`Loaded ${this.processedContent.length} items`);

            // Generate slides dynamically
            await this.generateSlides();

            return this.processedContent;

        } catch (error) {
            this.loadingState = 'error';
            console.warn('Could not load content:', error);

            // Fall back to demo content
            this.generateDemoContent();
            return this.processedContent;
        }
    }

    /**
     * Transform metadata from JSON format to ImageProcessor format
     */
    transformMetadata(metadata) {
        return metadata.map(item => {
            // Map source_image to source_photograph with proper structure
            const sourcePhotograph = item.source_image ? {
                photographer: item.source_image.photographer,
                probable_photographer: item.source_image.probable_photographer,
                publication: item.source_image.publication,
                subject: item.source_image.description,
                archive: item.source_image.archive,
                potential_archives: item.source_image.potential_archives,
                attribution_status: item.source_image.confidence || 'unconfirmed'
            } : null;

            // Create design justice analysis from available fields
            const designJusticeAnalysis = {
                proximity_to_violence: item.proximity_analysis || 'Analysis not available',
                attribution_transparency: item.source_image?.confidence || 'unconfirmed',
                who_benefits_who_bears_burden: item.critical_framework || 'Critical analysis not available',
                affordances_analysis: 'User controls and accessibility features provided',
                matrix_of_domination: item.aesthetic_tradition || 'Aesthetic context not specified',
                decolonial_implications: item.critical_framework || 'Analysis not available'
            };

            // Create historical context object
            const historicalContext = {
                event: item.historical_context || 'Historical context not available',
                participants: 'Not specified',
                political_context: item.critical_framework || 'Political context not available',
                aftermath: 'Not specified'
            };

            return {
                id: item.id,
                artist: item.artist,
                album: item.album,
                year: item.year,
                label: item.label,
                semantic_filename: item.semantic_filename,
                visual_description: item.alt_text?.detailed || item.alt_text?.brief || 'Visual description not available',
                source_photograph: sourcePhotograph,
                historical_context: historicalContext,
                design_justice_analysis: designJusticeAnalysis,
                content_warnings: item.content_warnings || [],
                sensitivity_level: item.sensitivity_level || 'moderate',
                blur_default: item.blur_default !== undefined ? item.blur_default : true,
                sources: item.sources || [],
                // Preserve original fields for reference
                _original: item
            };
        });
    }

    /**
     * Generate demo content for development/testing
     */
    generateDemoContent() {
        console.log('Generating demo content...');

        const demoData = [
            {
                id: "laibach-opus-dei-1987",
                artist: "Laibach",
                album: "Opus Dei",
                year: 1987,
                context: {
                    brief: "Appropriation of totalitarian aesthetic traditions",
                    historical_period: "Late Cold War",
                    political_context: "Yugoslav art collective's critique of totalitarianism through overidentification",
                    aesthetic_tradition: "Fascist and Soviet propaganda art appropriation",
                    critical_framework: "Overidentification as resistance strategy - using oppressive imagery to critique oppression"
                },
                content_warnings: ["Political imagery", "Historical totalitarian references"],
                sensitivity_level: "moderate",
                blur_default: true,
                tags: ["industrial", "political", "yugoslavia", "totalitarianism"],
                sources: [
                    "Academic article: 'Laibach and NSK: The Retro-avant-garde'",
                    "Artist interview: Neue Slowenische Kunst collective"
                ]
            },
            {
                id: "dead-kennedys-nazi-punks-1981",
                artist: "Dead Kennedys",
                album: "Nazi Punks Fuck Off (Single)",
                year: 1981,
                context: {
                    brief: "Anti-fascist punk confronting Nazi imagery in punk scenes",
                    historical_period: "Early 1980s punk movement",
                    political_context: "Response to far-right infiltration of punk scenes",
                    aesthetic_tradition: "Confrontational punk aesthetics",
                    critical_framework: "Direct confrontation rather than appropriation - using shock to reject fascist imagery"
                },
                content_warnings: ["Political imagery", "Anti-fascist content"],
                sensitivity_level: "low",
                blur_default: false,
                tags: ["punk", "anti-fascist", "political"],
                sources: [
                    "Jello Biafra interviews on punk politics",
                    "'Punk Rock: An Oral History' - John Robb"
                ]
            }
        ];

        if (this.imageProcessor) {
            this.processedContent = this.imageProcessor.processImageBatch(demoData);
        } else {
            this.processedContent = demoData;
        }

        this.generateSlides();
    }

    /**
     * Generate slides dynamically from processed content
     */
    async generateSlides() {
        const dynamicContainer = document.getElementById('dynamic-content-container');
        if (!dynamicContainer) {
            console.warn('Dynamic content container not found');
            return;
        }

        // Clear existing dynamic content
        dynamicContainer.innerHTML = '';

        // Generate slides for each processed item
        for (const item of this.processedContent) {
            const slideHTML = this.createSlideHTML(item);
            const slideElement = document.createElement('section');
            slideElement.innerHTML = slideHTML;

            // Copy attributes from the inner section to the outer section
            const innerSection = slideElement.querySelector('section');
            if (innerSection) {
                Array.from(innerSection.attributes).forEach(attr => {
                    slideElement.setAttribute(attr.name, attr.value);
                });
                slideElement.innerHTML = innerSection.innerHTML;
            }

            dynamicContainer.appendChild(slideElement);
        }

        // Re-initialize reveal.js to recognize new slides
        if (window.Reveal && typeof Reveal.sync === 'function') {
            Reveal.sync();
        }

        console.log(`Generated ${this.processedContent.length} dynamic slides`);
    }

    /**
     * Create HTML for individual slide
     */
    createSlideHTML(processedMetadata) {
        if (this.imageProcessor && typeof this.imageProcessor.createSlideHTML === 'function') {
            return this.imageProcessor.createSlideHTML(processedMetadata);
        }

        // Fallback slide creation
        return this.createFallbackSlideHTML(processedMetadata);
    }

    /**
     * Fallback slide creation if image processor unavailable
     */
    createFallbackSlideHTML(metadata) {
        const {
            id,
            artist,
            album,
            year,
            content_warnings,
            context,
            sources,
            blur_default,
            sensitivity_level = 'low'
        } = metadata;

        const warningsHtml = content_warnings ?
            `<div class="slide-warning">
                <strong>Content Warning:</strong> ${content_warnings.join(', ')}
            </div>` : '';

        const sourcesHtml = sources ?
            `<div class="slide-sources">
                <h5>Sources</h5>
                <ul>${sources.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>` : '';

        return `
            <h2>${artist} - ${album} (${year})</h2>

            ${warningsHtml}

            <div class="album-metadata">
                <div class="artist">${artist}</div>
                <div class="album">${album}</div>
                <div class="year">${year}</div>
                ${context.brief ? `<div class="context">${context.brief}</div>` : ''}
            </div>

            ${context.critical_framework ? `
            <div class="context-analysis">
                <h4>Critical Analysis</h4>
                <p>${context.critical_framework}</p>
            </div>` : ''}

            ${sourcesHtml}
        `;
    }

    /**
     * Get content by ID
     */
    getContentById(id) {
        return this.processedContent.find(item => item.id === id);
    }

    /**
     * Get content by sensitivity level
     */
    getContentBySensitivity(level) {
        return this.processedContent.filter(item => item.sensitivity_level === level);
    }

    /**
     * Get content with specific warnings
     */
    getContentWithWarnings() {
        return this.processedContent.filter(item => item.content_warnings && item.content_warnings.length > 0);
    }

    /**
     * Filter content by criteria
     */
    filterContent(criteria = {}) {
        let filtered = [...this.processedContent];

        if (criteria.sensitivity) {
            filtered = filtered.filter(item => item.sensitivity_level === criteria.sensitivity);
        }

        if (criteria.hasWarnings !== undefined) {
            filtered = filtered.filter(item => {
                const hasWarnings = item.content_warnings && item.content_warnings.length > 0;
                return hasWarnings === criteria.hasWarnings;
            });
        }

        if (criteria.year) {
            filtered = filtered.filter(item => item.year === criteria.year);
        }

        if (criteria.tags && criteria.tags.length > 0) {
            filtered = filtered.filter(item => {
                if (!item.tags) return false;
                return criteria.tags.some(tag => item.tags.includes(tag));
            });
        }

        return filtered;
    }

    /**
     * Generate content summary for accessibility
     */
    generateContentSummary() {
        const total = this.processedContent.length;
        const withWarnings = this.getContentWithWarnings().length;
        const byLevel = {
            high: this.getContentBySensitivity('high').length,
            moderate: this.getContentBySensitivity('moderate').length,
            low: this.getContentBySensitivity('low').length
        };

        return {
            total,
            withWarnings,
            sensitivityBreakdown: byLevel,
            description: `This presentation contains ${total} album artwork examples. ${withWarnings} items include content warnings. Sensitivity levels: ${byLevel.high} high, ${byLevel.moderate} moderate, ${byLevel.low} low.`
        };
    }

    /**
     * Export processed content for debugging
     */
    exportContent() {
        return {
            metadata: this.metadata,
            processed: this.processedContent,
            summary: this.generateContentSummary(),
            loadingState: this.loadingState
        };
    }

    /**
     * Reload content (useful for development)
     */
    async reloadContent() {
        this.metadata = [];
        this.processedContent = [];
        this.loadingState = 'idle';
        return this.loadContent();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
} else if (typeof window !== 'undefined') {
    window.ContentManager = ContentManager;
}