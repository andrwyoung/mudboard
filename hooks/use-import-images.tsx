import { useEffect } from "react";
import { CompressedImage } from "@/lib/process-images/compress-image";
import { imageNames } from "@/types/upload-settings";
import { BlockInsert, MudboardImage } from "@/types/block-types";
import { uploadImages } from "@/lib/process-images/upload-images";

type PreparedImage = {
  image_id: string;
  original_name: string;
  fileExt: string;

  variants: Record<imageNames, CompressedImage>;
  blurhash?: string;

  objectUrl: string;
  newImage: MudboardImage;
  bestEffortBlock: BlockInsert;
  tempBlockId: string;
};

export function useImageImport({
  sectionId,
  setIsDraggingFile,
  setDraggedFileCount,
}: {
  sectionId: string;
  setIsDraggingFile: (isDragging: boolean) => void;
  setDraggedFileCount: (count: number | null) => void;
}) {
  // handling importing images
  useEffect(() => {
    if (!sectionId) return;
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      const items = e.dataTransfer?.items;

      if (items && [...items].some((item) => item.kind === "file")) {
        dragCounter++;
        setIsDraggingFile(true);
        setDraggedFileCount(items.length);
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDraggingFile(false);
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
    }

    async function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingFile(false);

      const files = e.dataTransfer?.files;
      setDraggedFileCount(null);

      if (files && files.length > 0) {
        uploadImages(files, sectionId);
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleDragLeave);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, [sectionId]);
}
