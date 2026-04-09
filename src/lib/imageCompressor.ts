/**
 * Compress an image file client-side before uploading.
 * Uses canvas to resize and re-encode to JPEG/WebP for smaller file sizes.
 */
export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip non-image files or very small files (under 200KB)
    if (!file.type.startsWith("image/") || file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      const outputType = "image/webp";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compressed version is somehow larger, use original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: outputType, lastModified: Date.now() }
          );
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fall back to original on error
    };

    img.src = url;
  });
}
