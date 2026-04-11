/**
 * Compress an image file client-side before uploading.
 * Uses canvas to resize and re-encode to WebP for smaller file sizes.
 *
 * For files > 5MB, uses more aggressive compression to reduce upload time.
 * Accepts files up to 15MB (server also has its own compression as a safety net).
 */

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15MB max accepted

export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 2000,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Reject files over the upload limit
    if (file.size > MAX_UPLOAD_SIZE) {
      reject(new Error("File too large. Maximum size is 15MB."));
      return;
    }

    // Skip non-image files or very small files (under 200KB)
    if (!file.type.startsWith("image/") || file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    // For large files (>5MB), use more aggressive settings to speed up upload
    if (file.size > 5 * 1024 * 1024) {
      maxWidth = 1200;
      maxHeight = 1600;
      quality = 0.65;
    } else if (file.size > 2 * 1024 * 1024) {
      // Medium files (2-5MB): moderate compression
      quality = 0.75;
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

      // Try WebP first for best compression
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

          console.log(
            `Compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`
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
