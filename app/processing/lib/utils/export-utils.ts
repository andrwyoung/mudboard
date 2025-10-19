// Export utilities for image processing
// Handles format conversion, file size estimation, and blurhash generation

import {
  ProcessedImage,
  ExportSettings,
  ExportFormat,
} from "../types/exporter-types";

// File size estimate for individual images
export type FileSizeEstimate = {
  filename: string;
  originalSize: number;
  estimatedSize: number;
};

// Estimate file size for selected images
export function estimateFileSize(
  images: ProcessedImage[],
  selectedIds: string[],
  settings: ExportSettings
): FileSizeEstimate[] {
  if (selectedIds.length === 0) return [];

  const selectedImages = images.filter((img) => selectedIds.includes(img.id));

  return selectedImages.map((image) => {
    const originalSize = image.originalFile.size;
    const estimatedSize = calculateEstimatedSize(image, settings);

    return {
      filename: image.originalFile.name,
      originalSize,
      estimatedSize: Math.max(estimatedSize, 1000), // Minimum 1KB
    };
  });
}

// Calculate estimated size for a single image
function calculateEstimatedSize(
  image: ProcessedImage,
  settings: ExportSettings
): number {
  const originalSize = image.originalFile.size;
  const originalFormat = getFileFormat(image.originalFile.name);
  const pixels = image.width * image.height;

  // If converting to the same format with same/similar quality, use original size as baseline
  if (originalFormat === settings.format) {
    if (settings.format === "jpeg" || settings.format === "webp") {
      // For lossy formats, adjust based on quality difference
      const qualityRatio = settings.quality / 100;
      return originalSize * qualityRatio;
    } else if (settings.format === "png") {
      // PNG is lossless, so size should be similar
      return originalSize;
    }
  }

  // Cross-format conversion estimation
  let compressionRatio = 1;

  switch (settings.format) {
    case "webp":
      // WebP is generally more efficient than JPEG/PNG
      compressionRatio = originalFormat === "png" ? 0.25 : 0.6;
      compressionRatio *= settings.quality / 100;
      break;
    case "png":
      // PNG is less compressible, especially from JPEG
      compressionRatio = originalFormat === "jpeg" ? 2.5 : 1.2;
      break;
    case "jpeg":
      // JPEG compression varies significantly with quality
      compressionRatio = originalFormat === "png" ? 0.4 : 0.8;
      compressionRatio *= settings.quality / 100;
      break;
  }

  // Use pixel-based estimation as fallback for very different formats
  const pixelBasedEstimate =
    pixels * getBytesPerPixel(settings.format, settings.quality);

  // Blend original-size-based estimate with pixel-based estimate
  const sizeBasedEstimate = originalSize * compressionRatio;

  // Weight the estimates based on how reliable each method is
  let weight = originalFormat === settings.format ? 0.9 : 0.6;

  // Special case: PNG to WebP at small file sizes - weight more towards size-based estimate
  if (settings.format === "webp" && originalSize < 1024 * 1024) {
    weight = 0.9; // Heavily favor size-based estimate for small PNG->WebP conversions
  }

  return sizeBasedEstimate * weight + pixelBasedEstimate * (1 - weight);
}

// Get file format from filename
function getFileFormat(filename: string): ExportFormat | null {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "jpeg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    default:
      return null;
  }
}

// Get bytes per pixel estimate for different formats
function getBytesPerPixel(format: ExportFormat, quality: number): number {
  switch (format) {
    case "webp":
      return (quality / 100) * 0.12; // WebP is very efficient
    case "png":
      return 0.4; // PNG is less compressible
    case "jpeg":
      return (quality / 100) * 0.15; // JPEG compression varies with quality
    default:
      return 0.1;
  }
}
