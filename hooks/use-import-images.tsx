// here's the file we use to import images, but mainly here to handle the drag and drop behaviors.
// upload-images.tsx (which is called here) is the one handling the meat of the logic/uploading

import { useEffect } from "react";
import { uploadImages } from "@/lib/upload-images/upload-images";
import { Section } from "@/types/board-types";
import { toast } from "sonner";
import { isImageUrl } from "@/utils/upload-helpers";
import { resolveProxiedImageUrl } from "@/lib/upload-images/url-handling/resolve-image-links";
import { canEditBoard } from "../lib/auth/can-edit-board";
import { tryImportImageFromUrl } from "@/lib/upload-images/url-handling/import-image-from-url";

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

      if (!canEditBoard()) {
        console.log("Can't edit board. Not allowing drop");
        return;
      }

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
        tryImportImageFromUrl(imageUrl, selectedSection.section_id);
      }
    }

    function handlePaste(e: ClipboardEvent) {
      if (!canEditBoard()) {
        console.log("Can't edit board. Not allowing paste");
        return;
      }

      if (!selectedSection || selectedSection.section_id.trim() === "") {
        toast.error("No Selected Section");
        return;
      }

      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (const item of clipboardItems) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            uploadImages([file], selectedSection.section_id);
            return;
          }
        }

        if (item.kind === "string" && item.type === "text/plain") {
          item.getAsString(async (text) => {
            const maybeImage = resolveProxiedImageUrl(text);
            const imageUrl = maybeImage || text;

            if (!isImageUrl(imageUrl)) return;
            tryImportImageFromUrl(text, selectedSection.section_id);
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
  }, [selectedSection]);
}
