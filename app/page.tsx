"use client";
import Gallery from "./gallery";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { MudboardImage } from "@/types/image-type";
import { uploadImageToSupabase } from "@/lib/db-actions/upload-image";
import { fetchSupabaseImages } from "@/lib/db-actions/fetch-db-images";
import { toast } from "sonner";
import {
  allowedMimeTypes,
  COMPRESSED_IMAGE_WIDTH,
  DEFAULT_FILE_EXT,
} from "@/types/settings";
import { convertToWebP } from "@/lib/process-images/compress-image";

export default function Home() {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [orderedImages, setOrderedImages] = useState<MudboardImage[]>([]);
  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadImages() {
      const images = await fetchSupabaseImages();
      setOrderedImages(images);
    }

    loadImages();
  }, []);

  // handling importing images
  useEffect(() => {
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      dragCounter++;
      setIsDraggingFile(true);

      const items = e.dataTransfer?.items;
      if (items && items.length > 0) {
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
        setDraggedFileCount(files.length);

        const uploadPromises = Array.from(files).map(async (file) => {
          const image_id = uuidv4();

          const match = file.name.match(/^(.*)\.([^.]+)$/);
          const original_name = match ? match[1] : file.name;
          const fileExt = match ? match[2].toLowerCase() : null; // just used to check

          if (!fileExt) {
            throw new Error("Could not determine file extension.");
          }

          if (!allowedMimeTypes.includes(file.type)) {
            toast.error(`Unsupported file type: ${file.type}`);
            return;
          }

          let compressed;
          try {
            compressed = await convertToWebP(file, COMPRESSED_IMAGE_WIDTH);
          } catch (err) {
            toast.error(
              "Image conversion failed. Please try a different file."
            );
            console.log("Image Conversion failed: ", err);
            return;
          }
          const { file: compressedFile, width, height } = compressed;

          // create an objectURL so we can use it locally
          const objectUrl = URL.createObjectURL(compressedFile);

          const newImage: MudboardImage = {
            image_id,
            file_ext: DEFAULT_FILE_EXT,
            original_name,
            width,
            height,
            description: original_name,

            fileName: objectUrl, // this is just for local
            uploadStatus: "uploading",
          };
          // add it to gallery immediately
          setOrderedImages((prev) => [...prev, newImage]);

          // return the Promise and then update the image when it's done uploading
          return uploadImageToSupabase(compressedFile, newImage)
            .then(() => {
              setOrderedImages((prev) =>
                prev.map((img) =>
                  img.image_id === newImage.image_id
                    ? { ...img, uploadStatus: "uploaded" }
                    : img
                )
              );
            })
            .catch((err) => {
              console.error(err);
              setOrderedImages((prev) =>
                prev.map((img) =>
                  img.image_id === newImage.image_id
                    ? { ...img, uploadStatus: "error" }
                    : img
                )
              );
            });
        });

        await Promise.all(uploadPromises);
        toast.success(`Successfully uploaded ${uploadPromises.length} images!`);
        console.log(`All ${uploadPromises.length} uploads complete!`);
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
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isDraggingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white text-2xl">
          {draggedFileCount
            ? `Drop ${draggedFileCount} file${draggedFileCount > 1 ? "s" : ""}!`
            : "Drop your file!"}
        </div>
      )}

      {/* Sidebar */}
      <aside
        className="hidden lg:block w-1/6 min-w-[200px] max-w-[380px]
      bg-primary"
      >
        <Sidebar />
      </aside>

      {/* Gallery */}
      <main className="flex-1 overflow-y-scroll scrollbar-none">
        <Gallery imgs={orderedImages} />
      </main>
    </div>
  );
}
