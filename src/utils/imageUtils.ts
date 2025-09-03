/**
 * Creates a thumbnail from an image source
 * @param imageSrc - The source image (data URL or URL)
 * @param size - The size for the square thumbnail (default: 43)
 * @returns Promise<string> - Data URL of the thumbnail
 */
export const createThumbnail = (imageSrc: string, size: number = 43): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = size;
      canvas.height = size;
      
      // Calculate dimensions to crop to square from center
      const minDimension = Math.min(img.width, img.height);
      const sourceX = (img.width - minDimension) / 2;
      const sourceY = (img.height - minDimension) / 2;
      
      // Draw the image cropped and scaled to fit the square canvas
      ctx.drawImage(
        img,
        sourceX, sourceY, minDimension, minDimension, // Source rectangle (square crop from center)
        0, 0, size, size // Destination rectangle (full canvas)
      );
      
      // Convert to data URL
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageSrc;
  });
};

/**
 * Calculates the display size for an image while maintaining aspect ratio
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns Object with width and height
 */
export const calculateImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.min(originalWidth * ratio, maxWidth),
    height: Math.min(originalHeight * ratio, maxHeight)
  };
};