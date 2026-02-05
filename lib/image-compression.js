/**
 * Compresses an image file using the browser's Canvas API.
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - Maximum width of the output image.
 * @param {number} quality - Quality of the output JPEG (0 to 1).
 * @returns {Promise<File>} - A promise that resolves to the compressed File.
 */
export async function compressImage(file, maxWidth = 1280, quality = 0.8) {
  if (!file.type.startsWith('image/')) {
    return file; // Not an image, return original
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
