// Simplified version of use-import-images.tsx without Section or drag store dependencies
// Only handles drag and drop functionality for image imports

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isImageUrl } from "@/utils/upload-helpers";
import { resolveProxiedImageUrl } from "@/lib/upload-images/url-handling/resolve-image-links";

export function useSimpleImageImport({
  handleImage,
}: {
  handleImage: (files: File[]) => void;
}) {
  const [dragCount, setDragCount] = useState<number | null>(null);

  useEffect(() => {
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();

      const types = Array.from(e.dataTransfer?.types ?? []);
      const isFile = types.includes("Files");
      const isLinkOrHtml =
        types.includes("text/html") ||
        types.includes("text/uri-list") ||
        types.includes("text/plain");

      if (isFile || isLinkOrHtml) {
        dragCounter++;

        // Count the number of files being dragged
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          setDragCount(files.length);
        } else {
          setDragCount(1); // For URLs/HTML, assume 1 item
        }
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setDragCount(null);
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
    }

    async function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter = 0;
      setDragCount(null);

      const files = e.dataTransfer?.files;

      // Handle local files first
      if (files && files.length > 0) {
        handleImage(Array.from(files));
        return;
      }

      // Handle dropped URLs or images from other tabs
      const html = e.dataTransfer?.getData("text/html");
      const uri =
        e.dataTransfer?.getData("text/uri-list") ||
        e.dataTransfer?.getData("text/plain");
      let imageUrl: string | null = null;

      if (uri) {
        // Check if it matches any known URL patterns
        const maybeImage = resolveProxiedImageUrl(uri);
        imageUrl = maybeImage || uri;
      }

      if ((!imageUrl || !isImageUrl(imageUrl)) && html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
        if (match?.[1]) {
          imageUrl = match[1];
        }
      }

      if (imageUrl) {
        // For URL imports, we'll need to handle them differently
        // since we don't have a section to upload to
        toast.info("URL import not supported in this context");
      }
    }

    function handlePaste(e: ClipboardEvent) {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (const item of clipboardItems) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            handleImage([file]);
            return;
          }
        }

        if (item.kind === "string" && item.type === "text/plain") {
          item.getAsString(async (text) => {
            const maybeImage = resolveProxiedImageUrl(text);
            const imageUrl = maybeImage || text;

            if (!isImageUrl(imageUrl)) return;
            toast.info("URL import not supported in this context");
          });
        }
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("paste", handlePaste);
    };
  }, [handleImage]);

  return { dragCount };
}
