import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useOverlayStore } from "@/store/overlay-store";

export default function OverlayGallery({
  selectedBlock,
  isMirror,
}: {
  selectedBlock: Block;
  isMirror: boolean;
}) {
  const { closeOverlay: closeOverlayGallery } = useOverlayStore(
    isMirror ? "mirror" : "main"
  );
  const imageBlock = selectedBlock.data as MudboardImage;

  // zoomingggg
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.1));
  const resetZoom = () => setZoomLevel(1);
  const [showZoomControls, setShowZoomControls] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // calculate initial height and width
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth - 24 * 4; // remove padding (px-12)
    const containerHeight = container.clientHeight - 24 * 4; // remove padding (py-12)

    const imageAspect = imageBlock.width / selectedBlock.height;
    const containerAspect = containerWidth / containerHeight;

    let width = imageBlock.width;
    let height = selectedBlock.height;

    if (imageAspect > containerAspect) {
      width = containerWidth;
      height = containerWidth / imageAspect;
    } else {
      height = containerHeight;
      width = containerHeight * imageAspect;
    }

    setInitialSize({ width, height });
  }, [imageBlock.width, selectedBlock.height]);

  // dragggin the image around
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };

      // Prevent default drag behavior on image
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      container.scrollLeft -= dx;
      container.scrollTop -= dy;

      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
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
  }, [isDragging]);

  // scroll wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1; // up = zoom in, down = zoom out

        setZoomLevel((z) => {
          const next = z + direction * 0.1;
          return Math.min(Math.max(next, 0.1), 3); // clamp between 0.1 and 3
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // keyboard nav
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        resetZoom();
      } else if (e.key === "Escape") {
        closeOverlayGallery();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOverlayGallery]);

  // when users aren't active, hide the ui
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showControls = () => {
      setShowZoomControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowZoomControls(false);
      }, 1000);
    };

    const handleMouseMove = showControls;
    const handleMouseDown = showControls;
    const handleMouseUp = showControls;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={scrollContainerRef}
        className={`absolute inset-0 bg-stone-700/90 z-50 overflow-auto 
            scrollbar-none scrollbar-thumb-rounded scrollbar-thumb-background scrollbar-track-transparent
            `}
        onClick={() => closeOverlayGallery()}
        style={{}}
      >
        <div className="grid place-items-center min-w-full min-h-full">
          <div className="px-12 py-12 box-content">
            <div
              className="relative"
              style={{
                width: (initialSize?.width ?? imageBlock.width) * zoomLevel,
                height:
                  (initialSize?.height ?? selectedBlock.height) * zoomLevel,
              }}
              onClick={(e) => e.stopPropagation()}
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
                className={`h-full w-full object-contain rounded-md shadow-lg ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-4 right-4 z-60 bg-stone-800/80 backdrop-blur-sm rounded-lg p-2 hover:bg-stone-700/80 
          transition-all cursor-pointer duration-700 ${
            showZoomControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => closeOverlayGallery()}
      >
        <FaXmark />
      </div>

      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-62 bg-stone-800/80 backdrop-blur-sm 
        rounded-lg flex px-4 py-2 items-center gap-2 text-sm w-fit transition-opacity duration-700 ${
          showZoomControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          type="button"
          className="hover:scale-110 transition-transform font-bold text-sm cursor-pointer p-2"
        >
          <FaMinus />
        </button>
        <button
          type="button"
          title="Reset Zoom"
          className={`w-12 text-center select-none font-header font-semibold transition-all duration-200
            ${
              zoomLevel !== 1
                ? "cursor-pointer hover:underline hover:scale-105"
                : ""
            }`}
          onClick={resetZoom}
        >
          {(zoomLevel * 100).toFixed(0)}%
        </button>
        <button
          onClick={zoomIn}
          type="button"
          className="hover:scale-110 transition-transform font-bold text-sm cursor-pointer p-2"
        >
          <FaPlus />
        </button>
      </div>

      {/* <div
        className="absolute bg-stone-300 inset-0 z-20 w-full h-full opacity-80 flex flex-col items-center justify-center"
        onClick={() => setOverlayGalleryIsOpen(false)}
      >
        Hey
      </div> */}
    </>
  );
}
