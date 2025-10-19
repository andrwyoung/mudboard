import { DEFAULT_FILE_MIME } from "@/types/upload-settings";
import { ExportFormat } from "./exporter-types";

// Export settings presets
export const EXPORT_PRESETS = {
  webp: { format: "webp" as ExportFormat, quality: 80 },
  png: { format: "png" as ExportFormat, quality: 100 },
  jpeg: { format: "jpeg" as ExportFormat, quality: 85 },
} as const;

// Format options for UI
export const FORMAT_OPTIONS = [
  { value: "webp", label: "WebP (Modern)" },
  { value: "png", label: "PNG " },
  { value: "jpeg", label: "JPEG " },
] as const;

// MIME type mapping for export formats
const FORMAT_TO_MIME: Record<ExportFormat, string> = {
  webp: "image/webp",
  png: "image/png",
  jpeg: "image/jpeg",
};

// Get MIME type for format
export function getMimeType(format: ExportFormat): string {
  return FORMAT_TO_MIME[format] || DEFAULT_FILE_MIME;
}
