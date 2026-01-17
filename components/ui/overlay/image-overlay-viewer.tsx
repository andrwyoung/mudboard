import ColorWheel from "@/components/overlay-gallery/edit-buttons/color-picker/color-wheel";
import { EyedropperToggleButton } from "@/components/overlay-gallery/edit-buttons/color-picker/eyedropper-button";
import GreyscaleWheel from "@/components/overlay-gallery/edit-buttons/color-picker/gs-color-wheel";
import { GreyscaleToggleButton } from "@/components/overlay-gallery/edit-buttons/greyscale-button";
import { FlippedToggleButton } from "@/components/overlay-gallery/edit-buttons/mirror-button";
import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";
import { usePanImage } from "@/hooks/overlay-gallery.tsx/use-pan-image";
import { useCenteredZoom } from "@/hooks/overlay-gallery.tsx/use-center-zoom";
import { useGetInitialSizeOnLayout } from "@/hooks/overlay-gallery.tsx/use-get-initial-size";
import { Block } from "@/types/block-types";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaXmark, FaMinus, FaPlus } from "react-icons/fa6";

type OverlayModes = "drag" | "eyedropper";

interface ImageOverlayViewerProps {
  selectedBlock: Block;
  imageSrc: string;
  imageAlt: string;

  // Visual state (controlled from parent)
  isGreyscale: boolean;
  isFlipped: boolean;

  // Handlers (callbacks only, no side effects)
  onClose: () => void;
  onGreyscaleToggle: (value: boolean) => void;
  onFlippedToggle: (value: boolean) => void;

  // Optional: debug info
  debugInfo?: {
    showDebug: boolean;
    blockOrder?: number;
    sectionOrder?: number;
  };
}

export default function ImageOverlayViewer({
  selectedBlock,
  imageSrc,
  imageAlt,
  isGreyscale,
  isFlipped,
  onClose,
  onGreyscaleToggle,
  onFlippedToggle,
  debugInfo,
}: ImageOverlayViewerProps) {
  // Local UI state
  const [overlayMode, setOverlayMode] = useState<OverlayModes>("drag");
  const [eyedropperPos, setEyedropperPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showOverlayUI, setShowOverlayUI] = useState(true);

  // Zoom state (internal)
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Computed classes
  const overlayUIClass = `transition-all duration-700 text-off-white ${
    showOverlayUI
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
  }`;

  // Initialize size on layout
  useGetInitialSizeOnLayout(scrollContainerRef, selectedBlock, setInitialSize);

  // Zoom handlers
  const { zoomIn, zoomOut, resetZoom } = useCenteredZoom(
    scrollContainerRef,
    initialSize,
    zoomLevel,
    setZoomLevel
  );

  // eyedropper
  const {
    canvasRef,
    hoveredColor,
    onMouseMove,
    handleEyedropClick,
    isColorLight,
    hoveredHSV,
  } = useEyedropper(
    imageSrc,
    selectedBlock,
    initialSize,
    zoomLevel,
    isFlipped,
    isGreyscale
  );

  // panning
  const { isDragging } = usePanImage(scrollContainerRef);

  // Reset zoom when block changes (e.g., navigation to next/prev image)
  useEffect(() => {
    setZoomLevel(1);
    setInitialSize(null);
  }, [selectedBlock.block_id]);

  // Auto-hide UI on inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showControls = () => {
      setShowOverlayUI(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowOverlayUI(false);
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

  // Keyboard shortcuts
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
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, onClose]);

  return (
    <>
      <div
        ref={scrollContainerRef}
        className={`absolute inset-0 bg-stone-700/90 z-50 overflow-hidden
          scrollbar-none scrollbar-thumb-rounded scrollbar-thumb-background scrollbar-track-transparent
           ${!showOverlayUI ? "cursor-none" : ""}`}
        onClick={onClose}
      >
        <div className="grid place-items-center min-w-full min-h-full">
          <div className="px-12 py-12 box-content">
            {initialSize?.width && initialSize?.height && (
              <div
                className="relative"
                style={{
                  width: initialSize.width * zoomLevel,
                  height: initialSize.height * zoomLevel,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (overlayMode === "eyedropper" && hoveredColor) {
                    handleEyedropClick();
                    setOverlayMode("drag");
                  }
                }}
                onMouseMove={(e) => {
                  if (overlayMode === "eyedropper") {
                    onMouseMove(e);
                    setEyedropperPos({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseLeave={() => setEyedropperPos(null)}
              >
                <NextImage
                  src={imageSrc}
                  draggable={false}
                  alt={imageAlt}
                  width={selectedBlock.width}
                  height={selectedBlock.height}
                  // style={cropStyles}
                  className={`h-full w-full object-contain rounded-md shadow-lg ${
                    !showOverlayUI
                      ? "cursor-none"
                      : overlayMode === "eyedropper"
                      ? "cursor-crosshair"
                      : isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                  } 
                ${isGreyscale ? "grayscale" : ""}
                ${isFlipped ? "transform scale-x-[-1]" : ""}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`absolute top-4 right-4 z-60 bg-stone-800/80 backdrop-blur-sm rounded-lg p-2 hover:bg-stone-700/80 
       cursor-pointer ${overlayUIClass}`}
        onClick={onClose}
      >
        <FaXmark />
      </div>
      {overlayMode === "eyedropper" &&
        hoveredColor &&
        hoveredHSV &&
        eyedropperPos && (
          <>
            <div className="absolute bottom-4 right-4 z-60 ">
              {isGreyscale ? (
                <GreyscaleWheel
                  hoveredColor={hoveredColor}
                  luminance={hoveredHSV.v}
                />
              ) : (
                <ColorWheel
                  hoveredColor={hoveredColor}
                  hoveredHSV={hoveredHSV}
                  isColorLight={isColorLight}
                />
              )}
            </div>

            <div
              className={`fixed pointer-events-none z-70 flex items-baseline gap-2 px-2 py-1 
              rounded-md shadow border-2
            ${isColorLight ? "border-stone-700/80" : "border-white/70"}`}
              style={{
                left: eyedropperPos.x + 10,
                top: eyedropperPos.y + 10,
                backgroundColor: hoveredColor,
              }}
            >
              <div className="w-3 h-5" />
              {/* <p
              className={`text-xs font-mono font-bold translate-y-[1px] ${
                isColorLight ? "text-stone-800" : "text-off-white"
              }`}
            >
              {" "}
              {hoveredColor.toUpperCase()}
            </p> */}
            </div>
          </>
        )}

      {debugInfo?.showDebug && (
        <div
          className={`absolute top-4 left-4 z-62 bg-stone-800/80 backdrop-blur-sm 
      rounded-lg flex px-2 py-1 items-center gap-2 text-xs w-fit font-bold`}
        >
          block{" "}
          {debugInfo.blockOrder !== undefined
            ? debugInfo.blockOrder + 1
            : "unknown"}
          <br />
          section{" "}
          {debugInfo.sectionOrder !== undefined
            ? debugInfo.sectionOrder + 1
            : "unknown"}
        </div>
      )}
      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-62 bg-stone-800/80 backdrop-blur-sm 
      rounded-lg flex px-4 py-2 items-center gap-2 text-sm w-fit ${overlayUIClass}`}
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
        <EyedropperToggleButton
          isEyedropperActive={overlayMode === "eyedropper"}
          onToggle={() =>
            setOverlayMode((m) => (m === "drag" ? "eyedropper" : "drag"))
          }
        />
        <GreyscaleToggleButton
          isGreyscale={isGreyscale}
          onToggle={() => onGreyscaleToggle(!isGreyscale)}
        />
        <FlippedToggleButton
          isFlipped={isFlipped}
          onToggle={() => onFlippedToggle(!isFlipped)}
        />
      </div>

      {/* Navigation buttons removed - can be added back via props if needed */}

      <canvas
        ref={canvasRef} //
        width={selectedBlock.width}
        height={selectedBlock.height}
        style={{ display: "none", visibility: "hidden" }} // hidden: just used for eyedropper
      />
    </>
  );
}
