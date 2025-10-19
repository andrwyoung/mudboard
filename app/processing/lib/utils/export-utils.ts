// Export utilities for image processing
// Handles format conversion, file size estimation, and blurhash generation

import {
  ProcessedImage,
  ExportSettings,
  ExportFormat,
} from "../types/exporter-types";
import { getMimeType } from "../types/image-exporter-constants";
import { formatFileSize } from "./format-file-size";

// Main export function
export async function exportImages(
  images: ProcessedImage[],
  selectedIds: string[],
  settings: ExportSettings,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (selectedIds.length === 0) return;

  const selectedImages = images.filter((img) => selectedIds.includes(img.id));
  const total = selectedImages.length;

  for (let i = 0; i < selectedImages.length; i++) {
    await convertAndDownloadImage(
      selectedImages[i],
      settings.format,
      settings.quality
    );
    onProgress?.(((i + 1) / total) * 100);
  }
}

// Convert and download a single image
export async function convertAndDownloadImage(
  image: ProcessedImage,
  format: ExportFormat,
  quality: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const mimeType = getMimeType(format);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            downloadBlob(blob, image.originalFile.name, format);
            resolve();
          } else {
            reject(new Error("Failed to convert image"));
          }
        },
        mimeType,
        quality / 100
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = image.preview;
  });
}

// Download blob as file
function downloadBlob(
  blob: Blob,
  originalName: string,
  format: ExportFormat
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${originalName.split(".")[0]}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Estimate file size for selected images
export function estimateFileSize(
  images: ProcessedImage[],
  selectedIds: string[],
  settings: ExportSettings
): string {
  if (selectedIds.length === 0) return "0 B";

  const selectedImages = images.filter((img) => selectedIds.includes(img.id));
  const totalPixels = selectedImages.reduce(
    (sum, img) => sum + img.width * img.height,
    0
  );

  // Rough estimation based on format and quality
  let bytesPerPixel = 0.1; // Base estimate

  switch (settings.format) {
    case "webp":
      bytesPerPixel = (settings.quality / 100) * 0.15;
      break;
    case "png":
      bytesPerPixel = 0.5; // PNG is less compressible
      break;
    case "jpeg":
      bytesPerPixel = (settings.quality / 100) * 0.2;
      break;
  }

  const estimatedBytes = totalPixels * bytesPerPixel;
  return formatFileSize(Math.max(estimatedBytes, 1000)); // Minimum 1KB
}
