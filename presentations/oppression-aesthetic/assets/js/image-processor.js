/**
 * Image Processing and Analysis System
 * "Your Oppression: Our Aesthetic" Project
 *
 * Privacy-first, client-side image analysis and metadata processing
 * Generates accessible alt-text and handles sensitive content respectfully
 */

class ImageProcessor {
    constructor() {
        this.sensitivityThresholds = {
            low: ['historical', 'symbolic', 'abstract'],
            moderate: ['war', 'conflict', 'political', 'protest'],
            high: ['violence', 'atrocity', 'suffering', 'death', 'brutality']
        };

        this.contextualFrameworks = {
            historical: 'Historical period and events',
            political: 'Political context and power structures',
            aesthetic: 'Art historical and visual traditions',
            ethical: 'Ethical implications and responsibilities'
        };
    }

    /**
     * Generate semantic filename from metadata
     * Format: [artist]-[album]-[year]-[context].jpg
     */
    generateSemanticFilename(metadata) {
        const artist = this.sanitizeForFilename(metadata.artist);
        const album = this.sanitizeForFilename(metadata.album);
        const year = metadata.year;
        const context = this.sanitizeForFilename(metadata.context.brief || 'analysis');

        return `${artist}-${album}-${year}-${context}.jpg`.toLowerCase();
    }

    /**
     * Sanitize text for use in filenames
     */
    sanitizeForFilename(text) {
        return text
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Remove multiple consecutive hyphens
            .trim();
    }

    /**
     * Generate multiple levels of alt-text
     * Returns brief, detailed, and contextual descriptions
     */
    generateAltText(imageMetadata, visualAnalysis = null) {
        const { artist, album, year, context } = imageMetadata;

        // Brief alt-text (for screen readers)
        const brief = `Album cover for "${album}" by ${artist} (${year})`;

        // Detailed visual description
        const detailed = this.generateDetailedDescription(imageMetadata, visualAnalysis);

        // Contextual description with critical analysis
        const contextual = this.generateContextualDescription(imageMetadata);

        return {
            brief,
            detailed,
            contextual
        };
    }

    /**
     * Generate detailed visual description
     * Note: In production, this would integrate with computer vision APIs
     * For now, uses metadata-based description generation
     */
    generateDetailedDescription(metadata, visualAnalysis) {
        const baseDescription = `The album cover for "${metadata.album}" by ${metadata.artist} from ${metadata.year}`;

        if (visualAnalysis && visualAnalysis.description) {
            return `${baseDescription}. ${visualAnalysis.description}`;
        }

        // Fallback to metadata-based description
        if (metadata.visual_description) {
            return `${baseDescription}. ${metadata.visual_description}`;
        }

        return `${baseDescription}. Visual analysis available in contextual description.`;
    }

    /**
     * Generate contextual description with critical analysis
     */
    generateContextualDescription(metadata) {
        const { context } = metadata;
        let description = `This album artwork from ${metadata.year} `;

        if (context.aesthetic_tradition) {
            description += `draws from ${context.aesthetic_tradition}. `;
        }

        if (context.political_context) {
            description += `The political context includes: ${context.political_context}. `;
        }

        if (context.critical_framework) {
            description += `Critical analysis: ${context.critical_framework}. `;
        }

        if (context.ethical_considerations) {
            description += `Ethical considerations: ${context.ethical_considerations}`;
        }

        return description;
    }

    /**
     * Assess content sensitivity level
     * Returns: 'low', 'moderate', or 'high'
     */
    assessSensitivity(metadata) {
        const { content_warnings, context, tags } = metadata;

        // Check explicit content warnings
        if (content_warnings && content_warnings.length > 0) {
            return this.assessWarningLevel(content_warnings);
        }

        // Check context for sensitive themes
        const contextText = Object.values(context).join(' ').toLowerCase();
        const tagsText = tags ? tags.join(' ').toLowerCase() : '';
        const searchText = `${contextText} ${tagsText}`;

        // Check for high sensitivity keywords
        for (const keyword of this.sensitivityThresholds.high) {
            if (searchText.includes(keyword)) {
                return 'high';
            }
        }

        // Check for moderate sensitivity keywords
        for (const keyword of this.sensitivityThresholds.moderate) {
            if (searchText.includes(keyword)) {
                return 'moderate';
            }
        }

        // Check for low sensitivity keywords
        for (const keyword of this.sensitivityThresholds.low) {
            if (searchText.includes(keyword)) {
                return 'low';
            }
        }

        return 'low';
    }

    /**
     * Assess warning level from explicit content warnings
     */
    assessWarningLevel(warnings) {
        const warningText = warnings.join(' ').toLowerCase();

        const highRiskTerms = ['graphic violence', 'extreme content', 'disturbing imagery', 'atrocities'];
        const moderateRiskTerms = ['violence', 'war imagery', 'political content', 'historical trauma'];

        for (const term of highRiskTerms) {
            if (warningText.includes(term)) {
                return 'high';
            }
        }

        for (const term of moderateRiskTerms) {
            if (warningText.includes(term)) {
                return 'moderate';
            }
        }

        return 'low';
    }

    /**
     * Determine if image should have blur overlay by default
     */
    shouldBlurByDefault(sensitivityLevel, userPreferences = {}) {
        const { respectUserChoice = true, defaultBlurHigh = true, defaultBlurModerate = true } = userPreferences;

        if (!respectUserChoice) {
            return false;
        }

        switch (sensitivityLevel) {
            case 'high':
                return defaultBlurHigh;
            case 'moderate':
                return defaultBlurModerate;
            case 'low':
            default:
                return false;
        }
    }

    /**
     * Process image metadata and prepare for display
     * Returns enhanced metadata with generated alt-text, sensitivity assessment, etc.
     */
    processImageMetadata(rawMetadata, visualAnalysis = null) {
        const altText = this.generateAltText(rawMetadata, visualAnalysis);
        const sensitivityLevel = this.assessSensitivity(rawMetadata);
        const semanticFilename = this.generateSemanticFilename(rawMetadata);
        const shouldBlur = this.shouldBlurByDefault(sensitivityLevel);

        return {
            ...rawMetadata,
            alt_text: altText,
            sensitivity_level: sensitivityLevel,
            semantic_filename: semanticFilename,
            blur_default: rawMetadata.blur_default !== undefined ? rawMetadata.blur_default : shouldBlur,
            processed_at: new Date().toISOString()
        };
    }

    /**
     * Create slide HTML for processed image metadata with Design Justice analysis
     */
    createSlideHTML(processedMetadata) {
        const {
            id,
            artist,
            album,
            year,
            label,
            semantic_filename,
            visual_description,
            source_photograph,
            historical_context,
            design_justice_analysis,
            content_warnings,
            sensitivity_level,
            blur_default,
            sources
        } = processedMetadata;

        const imagePath = `content/images/${semantic_filename}`;
        const warningsHtml = content_warnings ?
            `<div class="slide-warning">
                <strong>Content Warning:</strong> ${content_warnings.join(', ')}
            </div>` : '';

        const blurClass = blur_default ? 'blurred' : '';
        const sensitiveClass = sensitivity_level === 'high' || sensitivity_level === 'moderate' ? 'sensitive' : '';

        // Attribution status indicator
        const attributionBadge = this.generateAttributionBadge(source_photograph);

        return `
        <section data-slide-id="${id}" data-sensitivity="${sensitivity_level}" data-attribution="${source_photograph?.attribution_status || 'unconfirmed'}">
            ${warningsHtml}

            <div class="slide-header">
                <h2>${artist} - ${album} (${year})</h2>
                ${attributionBadge}
            </div>

            <div class="slide-content">
                <div class="image-container">
                    <img src="${imagePath}"
                         alt="${visual_description}"
                         class="slide-image ${blurClass} ${sensitiveClass}"
                         data-slide-id="${id}">
                </div>

                <div class="metadata-container">
                    <div class="album-metadata">
                        <div class="artist">${artist}</div>
                        <div class="album">${album}</div>
                        <div class="year">${year}</div>
                        ${label ? `<div class="label">${label}</div>` : ''}
                    </div>

                    ${this.generateSourcePhotographHTML(source_photograph)}
                </div>
            </div>

            ${this.generateHistoricalContextHTML(historical_context)}
            ${this.generateDesignJusticeAnalysisHTML(design_justice_analysis)}
            ${sources ? this.generateSourcesHTML(sources) : ''}

            <aside class="notes">
                ${this.generateSpeakerNotes(processedMetadata)}
            </aside>
        </section>`;
    }

    /**
     * Generate attribution status badge
     */
    generateAttributionBadge(source_photograph) {
        if (!source_photograph) {
            return '<span class="attribution-badge unconfirmed">❓ Unconfirmed Attribution</span>';
        }

        const status = source_photograph.attribution_status;
        const icons = {
            'confirmed': '🔍',
            'probable': '📋',
            'unconfirmed': '❓'
        };

        const labels = {
            'confirmed': 'Confirmed Attribution',
            'probable': 'Probable Attribution',
            'unconfirmed': 'Unconfirmed Attribution'
        };

        return `<span class="attribution-badge ${status}">${icons[status]} ${labels[status]}</span>`;
    }

    /**
     * Generate source photograph information
     */
    generateSourcePhotographHTML(source_photograph) {
        if (!source_photograph) {
            return '';
        }

        let html = '<div class="source-photograph">';
        html += '<h4>Source Photograph</h4>';

        if (source_photograph.photographer) {
            html += `<p><strong>Photographer:</strong> ${source_photograph.photographer}</p>`;
        }
        if (source_photograph.probable_photographer) {
            html += `<p><strong>Probable Photographer:</strong> ${source_photograph.probable_photographer}</p>`;
        }
        if (source_photograph.publication) {
            html += `<p><strong>Published:</strong> ${source_photograph.publication}</p>`;
        }
        if (source_photograph.subject) {
            html += `<p><strong>Subject:</strong> ${source_photograph.subject}</p>`;
        }
        if (source_photograph.archive) {
            html += `<p><strong>Archive:</strong> ${source_photograph.archive}</p>`;
        }
        if (source_photograph.potential_archives) {
            html += `<p><strong>Potential Archives:</strong> ${source_photograph.potential_archives}</p>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * Generate historical context section
     */
    generateHistoricalContextHTML(historical_context) {
        if (!historical_context) {
            return '';
        }

        let html = '<div class="historical-context">';
        html += '<h4>Historical Context</h4>';

        if (historical_context.event) {
            html += `<p><strong>Event:</strong> ${historical_context.event}</p>`;
        }
        if (historical_context.participants) {
            html += `<p><strong>Participants:</strong> ${historical_context.participants}</p>`;
        }
        if (historical_context.political_context) {
            html += `<p><strong>Political Context:</strong> ${historical_context.political_context}</p>`;
        }
        if (historical_context.aftermath) {
            html += `<p><strong>Aftermath:</strong> ${historical_context.aftermath}</p>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * Generate Design Justice analysis section
     */
    generateDesignJusticeAnalysisHTML(design_justice_analysis) {
        if (!design_justice_analysis) {
            return '';
        }

        let html = '<div class="design-justice-analysis">';
        html += '<h4>Design Justice Analysis</h4>';

        const sections = [
            { key: 'proximity_to_violence', label: 'Proximity to Violence' },
            { key: 'attribution_transparency', label: 'Attribution Transparency' },
            { key: 'who_benefits_who_bears_burden', label: 'Who Benefits/Who Bears Burden' },
            { key: 'affordances_analysis', label: 'Affordances Analysis' },
            { key: 'matrix_of_domination', label: 'Matrix of Domination' },
            { key: 'decolonial_implications', label: 'Decolonial Implications' }
        ];

        sections.forEach(section => {
            if (design_justice_analysis[section.key]) {
                html += `
                <div class="analysis-section">
                    <h5>${section.label}</h5>
                    <p>${design_justice_analysis[section.key]}</p>
                </div>`;
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Generate speaker notes with comprehensive analysis
     */
    generateSpeakerNotes(metadata) {
        let notes = '';

        if (metadata.source_photograph?.attribution_status) {
            notes += `Attribution: ${metadata.source_photograph.attribution_status}. `;
        }

        if (metadata.design_justice_analysis?.proximity_to_violence) {
            notes += `Proximity: ${metadata.design_justice_analysis.proximity_to_violence}`;
        }

        return notes || 'See slide content for full analysis.';
    }

    /**
     * Generate context analysis section HTML
     */
    generateContextAnalysisHTML(context) {
        let html = '';

        if (context.political_context) {
            html += `
            <div class="context-analysis">
                <h4>Political Context</h4>
                <p>${context.political_context}</p>
            </div>`;
        }

        if (context.aesthetic_tradition) {
            html += `
            <div class="context-analysis">
                <h4>Aesthetic Tradition</h4>
                <p>${context.aesthetic_tradition}</p>
            </div>`;
        }

        if (context.critical_framework) {
            html += `
            <div class="context-analysis">
                <h4>Critical Analysis</h4>
                <p>${context.critical_framework}</p>
            </div>`;
        }

        return html;
    }

    /**
     * Generate sources section HTML
     */
    generateSourcesHTML(sources) {
        if (!sources || sources.length === 0) {
            return '';
        }

        const sourcesList = sources.map(source => `<li>${source}</li>`).join('');

        return `
        <div class="slide-sources">
            <h5>Sources</h5>
            <ul>${sourcesList}</ul>
        </div>`;
    }

    /**
     * Batch process multiple image metadata objects
     */
    processImageBatch(imageMetadataArray) {
        return imageMetadataArray.map(metadata => this.processImageMetadata(metadata));
    }

    /**
     * Export processed metadata as JSON for debugging/analysis
     */
    exportProcessedMetadata(processedData) {
        return JSON.stringify(processedData, null, 2);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
} else if (typeof window !== 'undefined') {
    window.ImageProcessor = ImageProcessor;
}