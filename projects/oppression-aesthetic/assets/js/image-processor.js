class ImageProcessor {
  processImageMetadata(rawImage) {
    const processed = Object.assign({}, rawImage);

    // Normalize alt_text field
    if (!processed.alt_text) {
      processed.alt_text = {
        brief: `${processed.artist || 'Unknown'} - ${processed.album || 'Unknown'} album cover`,
        detailed: processed.description || ''
      };
    } else if (typeof processed.alt_text === 'string') {
      processed.alt_text = {
        brief: processed.alt_text,
        detailed: processed.alt_text
      };
    }

    // Normalize source_image field
    if (!processed.source_image) {
      processed.source_image = { confidence: 'unconfirmed' };
    }

    // Normalize content_warnings to array
    if (!processed.content_warnings) {
      processed.content_warnings = [];
    } else if (typeof processed.content_warnings === 'string') {
      processed.content_warnings = [processed.content_warnings];
    }

    // Ensure sensitivity_level exists
    if (!processed.sensitivity_level) {
      processed.sensitivity_level = 'moderate';
    }

    return processed;
  }
}
