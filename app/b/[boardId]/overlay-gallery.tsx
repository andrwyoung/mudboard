// this is the overlay thing that happens when you double click an image
// or if you right-click -> Expand an image

import { Block, MudboardImage } from "@/types/block-types";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaChevronLeft, FaXmark } from "react-icons/fa6";
import { useOverlayStore } from "@/store/overlay-store";
import { useCenteredZoom } from "@/hooks/overlay-gallery.tsx/use-center-zoom";
import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import ColorWheel from "@/components/overlay-gallery/edit-buttons/color-picker/color-wheel";
import GreyscaleWheel from "@/components/overlay-gallery/edit-buttons/color-picker/gs-color-wheel";
import { getImageUrl } from "@/utils/get-image-url";
import { usePanImage } from "@/hooks/overlay-gallery.tsx/use-pan-image";
import { useGetInitialSizeOnLayout } from "@/hooks/overlay-gallery.tsx/use-get-initial-size";
import { updateGreyscaleSupabase } from "@/lib/db-actions/block-editing/update-greyscale";
import { updateFlippedSupabase } from "@/lib/db-actions/block-editing/update-flip";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { GreyscaleToggleButton } from "@/components/overlay-gallery/edit-buttons/greyscale-button";
import { FlippedToggleButton } from "@/components/overlay-gallery/edit-buttons/mirror-button";
import { EyedropperToggleButton } from "@/components/overlay-gallery/edit-buttons/color-picker/eyedropper-button";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import {
  getNextImageFrom,
  getPrevImageFrom,
} from "@/lib/local-helpers/get-prev-next-image";

type OverlayModes = "drag" | "eyedropper";

export default function OverlayGallery({
  isMirror,
  selectedBlock,
}: {
  isMirror: boolean;
  selectedBlock: Block;
}) {
  const {
    closeOverlay: closeOverlayGallery,
    setOverlayBlock: setSelectedBlock,
  } = useOverlayStore(isMirror ? "mirror" : "main");

  // note we never need visual overrides for mirror
  const visualOverridesMap = useLayoutStore((s) => s.visualOverridesMap);
  const setVisualOverride = useLayoutStore((s) => s.setVisualOverride);

  const masterBlockOrderMain = useLayoutStore(
    (s) => s.masterBlockOrder[selectedBlock.section_id]
  );
  const masterBlockOrderMirror = useSecondaryLayoutStore(
    (s) => s.masterBlockOrder
  );
  const masterBlockOrder = isMirror
    ? masterBlockOrderMirror
    : masterBlockOrderMain;

  const getNextImage = React.useCallback(
    (id: string) => getNextImageFrom(masterBlockOrder, id),
    [masterBlockOrder]
  );
  const getPrevImage = React.useCallback(
    (id: string) => getPrevImageFrom(masterBlockOrder, id),
    [masterBlockOrder]
  );
  const imageBlock = selectedBlock.data as MudboardImage;

  const [overlayMode, setOverlayMode] = useState<OverlayModes>("drag");
  const [isGreyscale, setIsGreyscale] = useState(
    visualOverridesMap.get(selectedBlock.block_id)?.is_greyscale ?? false
  );
  const [isFlipped, setIsFlipped] = useState(
    visualOverridesMap.get(selectedBlock.block_id)?.is_flipped ?? false
  );
  // const [crop, setCropped] = useState(
  //   visualOverridesMap.get(selectedBlock.block_id)?.crop
  // );
  // const cropStyles = crop
  //   ? {
  //       objectFit: "none" as const,
  //       objectPosition: `${crop.x}% ${crop.y}%`,
  //       width: `${100 / (crop.w / 100)}%`,
  //       height: `${100 / (crop.h / 100)}%`,
  //     }
  //   : {};

  // const [direction, setDirection] = useState<"left" | "right">("right");

  // zoomingggg
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOverlayUI, setShowOverlayUI] = useState(true);
  const overlayUIClass = `transition-all duration-700 ${
    showOverlayUI
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
  }`;

  const [eyedropperPos, setEyedropperPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // candy
  const showDebug = false;
  const [blockOrder, setBlockOrder] = useState<number | undefined>(undefined);
  const [sectionOrder, setSectionOrder] = useState<number | undefined>(
    undefined
  );
  const getBlockPositionMain = useLayoutStore((s) => s.getBlockPosition);
  const getBlockPositionMirror = useSecondaryLayoutStore(
    (s) => s.getBlockPosition
  );
  const getBlockPosition = isMirror
    ? getBlockPositionMirror
    : getBlockPositionMain;

  const boardSections = useMetadataStore((s) => s.boardSections);
  const section = boardSections.find(
    (s) => s.section.section_id === selectedBlock.section_id
  )?.section;
  const canSectionEdit = section ? canEditSection(section) : false;

  // debug info
  useEffect(() => {
    const blockPos = getBlockPosition(selectedBlock.block_id);
    setBlockOrder(blockPos?.orderIndex);

    const section = boardSections.find(
      (s) => s.section.section_id === blockPos?.sectionId
    );
    setSectionOrder(section?.order_index);
  }, [selectedBlock, getBlockPosition, boardSections]);

  // reset modes
  const resetModes = () => {
    setZoomLevel(1);
    setInitialSize(null);
    setIsFlipped(false);
    setIsGreyscale(false);
    // setOverlayMode("drag");
  };

  // flipping to next and prev block
  const goToNextBlock = React.useCallback(() => {
    const next = getNextImage(selectedBlock.block_id);
    if (next) {
      resetModes();
      setSelectedBlock(next.block);
    }
  }, [getNextImage, selectedBlock.block_id, setSelectedBlock]);

  const goToPrevBlock = React.useCallback(() => {
    const prev = getPrevImage(selectedBlock.block_id);
    if (prev) {
      resetModes();
      setSelectedBlock(prev.block);
    }
  }, [getPrevImage, selectedBlock.block_id, setSelectedBlock]);

  // when users aren't active, hide the ui
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

  // SECTION: hooks
  //

  // panning
  useGetInitialSizeOnLayout(scrollContainerRef, selectedBlock, setInitialSize);
  const { isDragging } = usePanImage(scrollContainerRef);

  /// zoooming
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
    getImageUrl(imageBlock.image_id, imageBlock.file_ext, "full"),
    selectedBlock,
    initialSize,
    zoomLevel,
    isFlipped,
    isGreyscale
  );

  // keyboard nav
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedBlock) return;

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
      // else if (e.key === "ArrowRight") {
      //   goToNextBlock();
      // } else if (e.key === "ArrowLeft") {
      //   goToPrevBlock();
      // }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    closeOverlayGallery,
    zoomIn,
    zoomOut,
    resetZoom,
    goToNextBlock,
    goToPrevBlock,
    selectedBlock,
  ]);

  return (
    <>
      <div
        ref={scrollContainerRef}
        className={`absolute inset-0 bg-stone-700/90 z-50 overflow-hidden
            scrollbar-none scrollbar-thumb-rounded scrollbar-thumb-background scrollbar-track-transparent
             ${!showOverlayUI ? "cursor-none" : ""}`}
        onClick={() => closeOverlayGallery()}
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
                  src={getImageUrl(
                    imageBlock.image_id,
                    imageBlock.file_ext,
                    "full"
                  )}
                  draggable={false}
                  alt={selectedBlock.caption ?? imageBlock.original_name}
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
        onClick={() => closeOverlayGallery()}
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
                  isColorLight ? "text-stone-800" : "text-white"
                }`}
              >
                {" "}
                {hoveredColor.toUpperCase()}
              </p> */}
            </div>
          </>
        )}

      {showDebug && (
        <div
          className={`absolute top-4 left-4 z-62 bg-stone-800/80 backdrop-blur-sm 
        rounded-lg flex px-2 py-1 items-center gap-2 text-xs w-fit font-bold`}
        >
          block {blockOrder !== undefined ? blockOrder + 1 : "unknown"}
          <br />
          section {sectionOrder !== undefined ? sectionOrder + 1 : "unknown"}
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
          onToggle={() => {
            const newValue = !isGreyscale;
            setIsGreyscale(newValue);

            if (!isMirror) {
              updateGreyscaleSupabase(
                selectedBlock.block_id,
                newValue,
                canSectionEdit
              );
              setVisualOverride(selectedBlock.block_id, {
                is_greyscale: newValue,
              });
            }
          }}
        />
        <FlippedToggleButton
          isFlipped={isFlipped}
          onToggle={() => {
            const newValue = !isFlipped;
            setIsFlipped(newValue);

            if (!isMirror) {
              updateFlippedSupabase(
                selectedBlock.block_id,
                newValue,
                canSectionEdit
              );
              setVisualOverride(selectedBlock.block_id, {
                is_flipped: newValue,
              });
            }
          }}
        />
      </div>

      {false && (
        <>
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-60 bg-stone-800/80 backdrop-blur-sm rounded-lg p-2 
          ${
            getPrevImage(selectedBlock.block_id)
              ? "bg-stone-800/80 hover:bg-stone-700/80 cursor-pointer"
              : "bg-stone-800/20 text-white/20"
          } 
          ${overlayUIClass}`}
            onClick={(e) => {
              e.stopPropagation();
              goToPrevBlock();
            }}
          >
            <FaChevronLeft className="size-6" />
          </div>
          <div
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-60 backdrop-blur-sm rounded-lg p-2 
          ${
            getNextImage(selectedBlock.block_id)
              ? "bg-stone-800/80 hover:bg-stone-700/80 cursor-pointer"
              : "bg-stone-800/20 text-white/20"
          } 
          ${overlayUIClass}`}
            onClick={(e) => {
              e.stopPropagation();
              goToNextBlock();
            }}
          >
            <FaChevronLeft className="size-6 rotate-180" />
          </div>
        </>
      )}

      {/* <div
        className="absolute bg-stone-300 inset-0 z-20 w-full h-full opacity-80 flex flex-col items-center justify-center"
        onClick={() => setOverlayGalleryIsOpen(false)}
      >
        Hey
      </div> */}

      <canvas
        ref={canvasRef} //
        width={selectedBlock.width}
        height={selectedBlock.height}
        style={{ display: "none", visibility: "hidden" }} // hidden: just used for eyedropper
      />
    </>
  );
}
