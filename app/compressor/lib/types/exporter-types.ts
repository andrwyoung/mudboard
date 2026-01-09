export type ExportFormat = "webp" | "png" | "jpeg";

export type ProcessedImage = {
  id: string;
  originalFile: File;
  preview: string;
  width: number;
  height: number;
};

export type ExportSettings = {
  format: ExportFormat;
  quality: number;
};
