// Utility function for handling image file processing
// Can be reused across different components that need image handling

import { toast } from "sonner";
import { allowedMimeTypes } from "@/types/upload-settings";
import {
  useImageStore,
  ProcessedImage,
} from "../../../store/home-page/image-store";

export async function handleImageFiles(files: File[]) {
  const { addImages } = useImageStore.getState();
  const newImages: ProcessedImage[] = [];

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.type)) {
      toast.error(`${file.name} is not a supported image file`);
      continue;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const preview = URL.createObjectURL(file);

    newImages.push({
      id,
      originalFile: file,
      preview,
    });
  }

  if (newImages.length === 0) {
    toast.error("No valid image files found");
    return;
  }

  addImages(newImages);
  toast.success(`Added ${newImages.length} image(s)`);
}
