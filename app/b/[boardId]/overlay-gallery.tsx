import { getImageUrl } from "@/components/blocks/image-block";
import { useSelectionStore } from "@/store/selection-store";
import { MudboardImage } from "@/types/block-types";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

export default function OverlayGallery() {
  const overlayGalleryIsOpen = useSelectionStore((s) => s.overlayGalleryIsOpen);
  const closeOverlayGallery = useSelectionStore((s) => s.closeOverlayGallery);
  const selectedBlock = useSelectionStore((s) => s.overlayGalleryShowing);

  const imageBlock = selectedBlock?.data as MudboardImage;

  const zoomLevel = 1;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // drag while in the thing
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!overlayGalleryIsOpen || !container) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";

      // Prevent default drag behavior on image
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !dragStart.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      container.scrollLeft -= dx;
      container.scrollTop -= dy;

      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging.current = false;
      dragStart.current = null;
      container.style.cursor = "default";
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, overlayGalleryIsOpen]);

  // keyboard nav
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // deselect with escape
      if (e.key === "Escape") {
        closeOverlayGallery();
      }
      // Add more keys (Arrow keys for movement, etc.) as needed
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOverlayGallery]);

  return (
    <>
      {overlayGalleryIsOpen && selectedBlock && imageBlock && (
        <div
          ref={scrollContainerRef}
          className={`absolute inset-0 bg-stone-700/90 z-50 overflow-auto 
            scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-background scrollbar-track-transparent
            `}
          //   onClick={() => closeOverlayGallery()}
          style={{}}
        >
          <div className="grid place-items-center min-w-full min-h-full">
            <div className="px-12 py-12 box-content">
              <div
                className="relative"
                style={{
                  width: imageBlock.width * zoomLevel, // controls horizontal zoom
                  height: selectedBlock.height * zoomLevel, // controls vertical zoom
                }}
              >
                <Image
                  src={getImageUrl(
                    imageBlock.image_id,
                    imageBlock.file_ext,
                    "full"
                  )}
                  draggable={false}
                  alt={imageBlock.caption ?? imageBlock.original_name}
                  width={imageBlock.width}
                  height={selectedBlock.height}
                  className="h-full w-full object-contain rounded-md shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <div
        className="absolute bg-stone-300 inset-0 z-20 w-full h-full opacity-80 flex flex-col items-center justify-center"
        onClick={() => setOverlayGalleryIsOpen(false)}
      >
        Hey
      </div> */}
    </>
  );
}
