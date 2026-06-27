const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Processes an uploaded image by resizing and compressing it to reduce token usage and improve OCR results.
 * @param {string} filePath - The path to the uploaded image.
 * @returns {Promise<string>} - The base64 encoded string of the processed image.
 */
const processImageForOCR = async (filePath) => {
    try {
        const processedBuffer = await sharp(filePath)
            .resize({
                width: 1500, // Reasonable max width
                height: 1500,
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            // Increase contrast and normalize to help OCR
            .normalize()
            // Convert to JPEG with moderate quality to save size/tokens
            .jpeg({ quality: 80 })
            .toBuffer();

        // Convert the processed buffer to a base64 string
        const base64Image = processedBuffer.toString('base64');
        return base64Image;
    } catch (error) {
        console.error('Error in image processing:', error);
        throw new Error('Failed to process image for OCR.');
    }
};

module.exports = {
    processImageForOCR
};
