import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaAdjust, FaMinus, FaPlus } from "react-icons/fa";
import { FaEyeDropper, FaXmark } from "react-icons/fa6";
import { useOverlayStore } from "@/store/overlay-store";
import { useCenteredZoom } from "@/hooks/overlay-gallery.tsx/use-zoom";
import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";

type OverlayModes = "drag" | "eyedropper";

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
  const [overlayMode, setOverlayMode] = useState<OverlayModes>("drag");
  const [isGreyscale, setIsGreyscale] = useState(false);

  // zoomingggg
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // candy
  const [greyscaleClicked, setGreyscaleClicked] = useState(false);

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
    if (overlayMode !== "drag") return;

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

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, overlayMode]);

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

  // SECTION: hooks
  //

  /// zoooming
  const { zoomIn, zoomOut, resetZoom } = useCenteredZoom(
    scrollContainerRef,
    initialSize,
    zoomLevel,
    setZoomLevel
  );

  // eyedropper
  const { canvasRef, hoveredColor, onMouseMove, handleEyedropClick } =
    useEyedropper(imageBlock, selectedBlock, initialSize, zoomLevel);

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
  }, [closeOverlayGallery, zoomIn, zoomOut, resetZoom]);

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
              onClick={(e) => {
                e.stopPropagation();
                if (overlayMode === "eyedropper" && hoveredColor) {
                  handleEyedropClick();
                  setOverlayMode("drag");
                }
              }}
              onMouseMove={(e) => {
                if (overlayMode === "eyedropper") onMouseMove(e);
              }}
            >
              <NextImage
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
                  overlayMode === "eyedropper"
                    ? "cursor-crosshair"
                    : isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                } ${isGreyscale ? "grayscale" : ""}`}
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
      {overlayMode === "eyedropper" && hoveredColor && (
        <div
          className="absolute top-16 right-4 z-70 rounded-lg shadow h-8 w-8"
          style={{
            backgroundColor: hoveredColor,
          }}
        />
      )}

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
        <button
          title="Use Eyedropper"
          onClick={() =>
            setOverlayMode((m) => (m === "drag" ? "eyedropper" : "drag"))
          }
          className={`cursor-pointer hover:text-accent hover:bg-white transition-all p-2 rounded-lg ${
            overlayMode === "eyedropper" ? "bg-white text-stone-800/80" : ""
          }`}
        >
          <FaEyeDropper />
        </button>
        <button
          onClick={() => {
            setIsGreyscale((g) => !g);
            setGreyscaleClicked(true);
            setTimeout(() => setGreyscaleClicked(false), 400); // match animation duration
          }}
          title="Toggle Greyscale"
          className={`p-2 rounded-lg cursor-pointer  group transition-all  ${
            isGreyscale ? "bg-white text-stone-800/80" : ""
          }`}
        >
          <FaAdjust
            className={`transition-transform duration-400 ${
              greyscaleClicked ? "animate-spin-once" : ""
            }`}
          />
        </button>
      </div>

      {/* <div
        className="absolute bg-stone-300 inset-0 z-20 w-full h-full opacity-80 flex flex-col items-center justify-center"
        onClick={() => setOverlayGalleryIsOpen(false)}
      >
        Hey
      </div> */}

      <canvas
        ref={canvasRef} //
        width={imageBlock.width}
        height={selectedBlock.height}
        // style={{ display: "none" }} // hidden: just used for eyedropper
      />
    </>
  );
}
