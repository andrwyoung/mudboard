import {
  ProcessedImage,
  ExportSettings,
  ExportFormat,
} from "../types/exporter-types";
import { getMimeType } from "../types/image-exporter-constants";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
  const zip = new JSZip();

  for (let i = 0; i < selectedImages.length; i++) {
    const image = selectedImages[i];
    const originalFormat = getFileFormat(image.originalFile.name);

    // Edge case: if same format and 100% quality, use original file
    if (originalFormat === settings.format && settings.quality === 100) {
      console.log("orignal format and 100%. just sending back originals");

      const blob = image.originalFile;
      const filename = getExportFilename(
        image.originalFile.name,
        settings.format
      );
      zip.file(filename, blob);
    } else {
      // Convert the image
      const blob = await convertImageToBlob(
        image,
        settings.format,
        settings.quality
      );

      if (blob) {
        const filename = getExportFilename(
          image.originalFile.name,
          settings.format
        );
        zip.file(filename, blob);
      }
    }

    onProgress?.(((i + 1) / total) * 100);
  }

  // Generate and download the zip file
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipFilename = generateExportFilename(settings);
  saveAs(zipBlob, zipFilename);
}

// Convert image to blob (for zip export)
async function convertImageToBlob(
  image: ProcessedImage,
  format: ExportFormat,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const mimeType = getMimeType(format);

      // Use 99% quality instead of 100% to avoid potential issues
      const adjustedQuality = quality === 100 ? 0.99 : quality / 100;

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mimeType,
        adjustedQuality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = image.preview;
  });
}

// Generate user-friendly export filename
function generateExportFilename(
  settings: ExportSettings
  // fileCount: number
): string {
  return `mudboard-${settings.format}${settings.quality}-export.zip`;
}

// Generate export filename for individual files
function getExportFilename(originalName: string, format: ExportFormat): string {
  const nameWithoutExt = originalName.split(".")[0];
  return `${nameWithoutExt}.${format}`;
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
