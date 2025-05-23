import { useEffect } from "react";
import { CompressedImage } from "@/lib/upload-images/processing/compress-image";
import { imageNames } from "@/types/upload-settings";
import { BlockInsert, MudboardImage } from "@/types/block-types";
import { uploadImages } from "@/lib/upload-images/upload-images";
import { Section } from "@/types/board-types";
import { toast } from "sonner";
import { isImageUrl } from "@/utils/upload-helpers";
import { getImageBlobSmart } from "@/lib/upload-images/url-handling/fetch-image-from-url";
import {
  resolveProxiedImageUrl,
  upgradePinterestImage,
} from "@/lib/upload-images/url-handling/resolve-image-links";

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
  selectedSection,
  setIsDraggingFile,
  setDraggedFileCount,
}: {
  selectedSection: Section | null;
  setIsDraggingFile: (isDragging: boolean) => void;
  setDraggedFileCount: (count: number | null) => void;
}) {
  // handling importing images
  useEffect(() => {
    if (!selectedSection) return;
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      console.log("entering!");
      e.preventDefault();

      const types = Array.from(e.dataTransfer?.types ?? []);
      const items = e.dataTransfer?.items;
      const isFile = types.includes("Files");
      const isLinkOrHtml =
        types.includes("text/html") ||
        types.includes("text/uri-list") ||
        types.includes("text/plain");

      if (isFile || isLinkOrHtml) {
        dragCounter++;
        setIsDraggingFile(true);

        // Only set count if we're dragging files
        if (isFile && items) {
          setDraggedFileCount(items.length);
        } else {
          setDraggedFileCount(null); // we don’t know count for link/image drag
        }
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
      setDraggedFileCount(null);

      console.log("handline drop. here's what we have: ", e);

      const files = e.dataTransfer?.files;

      // checks
      if (!selectedSection || selectedSection.section_id.trim() === "") {
        toast.error("No Selected Section");
        return;
      }

      // first check if these files are from local. handle that first
      if (files && files.length > 0) {
        uploadImages(Array.from(files), selectedSection.section_id);
        return;
      }

      // SECTION

      // then check if it's a dropped URL or image from another tab
      const html = e.dataTransfer?.getData("text/html");
      const uri =
        e.dataTransfer?.getData("text/uri-list") ||
        e.dataTransfer?.getData("text/plain");
      let imageUrl: string | null = null;

      console.log("html: ", html, "uri: ", uri);

      if (uri) {
        // Step 1: check if it matches any known url funks
        const maybeImage = resolveProxiedImageUrl(uri);
        imageUrl = maybeImage || uri;

        // Step 2 DISABLED: now check if it's an image URL
        // if (isImageUrl(finalUrl)) {
        //   imageUrl = finalUrl;
        // }
      }

      if ((!imageUrl || !isImageUrl(imageUrl)) && html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
        if (match?.[1]) {
          imageUrl = match[1];
        }
      }

      console.log("this is the url we are trying to get: ", imageUrl);

      if (imageUrl) {
        // Pinterest 236x → 736x upgrade
        const upgradedUrl = upgradePinterestImage(imageUrl);

        // grab the image itself
        // Try high-res version first
        let blob = await getImageBlobSmart(upgradedUrl);

        // If that fails, fallback to original 236x
        if (!blob && upgradedUrl !== imageUrl) {
          blob = await getImageBlobSmart(imageUrl);
        }

        if (blob) {
          const filename = imageUrl.split("/").pop() ?? "image.jpg";
          const file = new File([blob], filename, { type: blob.type });
          uploadImages([file], selectedSection.section_id);
        } else {
          toast.error("Failed to load image — source may block downloads.");
        }
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
  }, [selectedSection]);
}
