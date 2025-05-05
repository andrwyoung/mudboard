"use client";
import Gallery from "./gallery";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { ImageType } from "@/types/image-type";
import { uploadImageToSupabase } from "@/lib/db-actions/upload-image";
import { fetchSupabaseImages } from "@/lib/db-actions/fetch-db-images";
import { getImageDimensions } from "@/lib/process-images/get-img-dimensions";

export default function Home() {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [orderedImages, setOrderedImages] = useState<ImageType[]>([]);

  useEffect(() => {
    async function loadImages() {
      const images = await fetchSupabaseImages();
      setOrderedImages(images);
    }

    loadImages();
  }, []);

  useEffect(() => {
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      dragCounter++;
      setIsDraggingFile(true);
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

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const image_id = uuidv4();
        const { width, height } = await getImageDimensions(file);

        const match = file.name.match(/^(.*)\.([^.]+)$/);
        const original_name = match ? match[1] : file.name;
        const file_ext = match ? match[2].toLowerCase() : null;

        if (!file_ext) {
          throw new Error("Could not determine file extension.");
        }

        const objectUrl = URL.createObjectURL(file);

        const newImage: ImageType = {
          image_id,
          file_ext,
          original_name,
          width,
          height,
          description: original_name,
          fileName: objectUrl, // this is just for local
        };
        // Show it right away
        setOrderedImages((prev) => [...prev, newImage]);

        uploadImageToSupabase(file, newImage)
          .then((img) => console.log("Image uploaded:", img))
          .catch(console.error);
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
          Drop your file!
        </div>
      )}

      {/* Sidebar */}
      <aside
        className="hidden lg:block w-1/6 min-w-[200px] max-w-[300px]
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
