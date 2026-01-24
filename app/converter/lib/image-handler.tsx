// Utility function for handling image file processing
// Returns processed images instead of mutating global state

import { toast } from "sonner";
import { allowedMimeTypes } from "@/types/upload-settings";
import { getImageDimensions } from "./utils/get-image-dimensions";

export type ProcessedImage = {
  id: string;
  originalFile: File;
  preview: string;
  width: number;
  height: number;
};

export async function processImageFiles(
  files: File[]
): Promise<ProcessedImage[]> {
  const newImages: ProcessedImage[] = [];

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.type)) {
      toast.error(`${file.name} is not a supported image file`);
      continue;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const preview = URL.createObjectURL(file);

    // Get image dimensions
    const dimensions = await getImageDimensions(file);

    newImages.push({
      id,
      originalFile: file,
      preview,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  if (newImages.length === 0) {
    toast.error("No valid image files found");
    return [];
  }

  toast.success(`Added ${newImages.length} image(s)`);
  return newImages;
}
