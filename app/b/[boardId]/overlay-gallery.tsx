// this is the overlay thing that happens when you double click an image
// or if you right-click -> Expand an image

import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaAdjust, FaArrowsAltH, FaMinus, FaPlus } from "react-icons/fa";
import { FaChevronLeft, FaEyeDropper, FaXmark } from "react-icons/fa6";
import { useOverlayStore } from "@/store/overlay-store";
import { useCenteredZoom } from "@/hooks/overlay-gallery.tsx/use-zoom";
import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";

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

  const getNextImage = useLayoutStore((s) => s.getNextImage);
  const getPrevImage = useLayoutStore((s) => s.getPrevImage);
  const imageBlock = selectedBlock.data as MudboardImage;
  const [overlayMode, setOverlayMode] = useState<OverlayModes>("drag");
  const [isGreyscale, setIsGreyscale] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

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
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // candy
  const showDebug = false;
  const [greyscaleClicked, setGreyscaleClicked] = useState(false);
  const [blockOrder, setBlockOrder] = useState<number | undefined>(undefined);
  const [sectionOrder, setSectionOrder] = useState<number | undefined>(
    undefined
  );
  const getBlockPosition = useLayoutStore((s) => s.getBlockPosition);
  const sections = useMetadataStore((s) => s.sections);

  // debug info
  useEffect(() => {
    const blockPos = getBlockPosition(selectedBlock.block_id);
    setBlockOrder(blockPos?.orderIndex);

    const section = sections.find((s) => s.section_id === blockPos?.sectionId);
    setSectionOrder(section?.order_index);
  }, [selectedBlock, getBlockPosition, sections]);

  // flipping to next and prev block
  const goToNextBlock = React.useCallback(() => {
    const next = getNextImage(selectedBlock.block_id);
    if (next) {
      setInitialSize(null);
      setSelectedBlock(next.block);
    }
  }, [getNextImage, selectedBlock.block_id, setSelectedBlock]);

  const goToPrevBlock = React.useCallback(() => {
    const prev = getPrevImage(selectedBlock.block_id);
    if (prev) {
      setInitialSize(null);
      setSelectedBlock(prev.block);
    }
  }, [getPrevImage, selectedBlock.block_id, setSelectedBlock]);

  // calculate initial height and width
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !selectedBlock.width) return;

    const containerWidth = container.clientWidth - 24 * 4; // remove padding (px-12)
    const containerHeight = container.clientHeight - 24 * 4; // remove padding (py-12)

    const imageAspect = selectedBlock.width / selectedBlock.height;
    const containerAspect = containerWidth / containerHeight;

    let width = selectedBlock.width;
    let height = selectedBlock.height;

    if (imageAspect > containerAspect) {
      width = containerWidth;
      height = containerWidth / imageAspect;
    } else {
      height = containerHeight;
      width = containerHeight * imageAspect;
    }

    setInitialSize({ width, height });
    // disable lint cause we want that scrollcontainerRef here with us
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlock.width, selectedBlock.height, scrollContainerRef.current]);

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
    imageBlock,
    selectedBlock,
    initialSize,
    zoomLevel,
    isFlipped
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
      } else if (e.key === "ArrowRight") {
        goToNextBlock();
      } else if (e.key === "ArrowLeft") {
        goToPrevBlock();
      }
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
        style={{}}
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
                  className={`h-full w-full object-contain rounded-md shadow-lg ${
                    !showOverlayUI
                      ? "cursor-none"
                      : overlayMode === "eyedropper"
                      ? "cursor-crosshair"
                      : isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                  } ${isGreyscale ? "grayscale" : ""}
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
      {overlayMode === "eyedropper" && hoveredColor && (
        <>
          {hoveredHSV && (
            <div className="absolute bottom-4 right-4 z-60 flex flex-col items-center ">
              <p className="text-xs font-mono text-stone-200 font-bold text-center">
                {hoveredColor.replace("#", "").toUpperCase()}
              </p>

              <div className="relative w-24 h-24 rounded-t-md overflow-hidden shadow-inner ">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `hsl(${hoveredHSV.h}, 100%, 50%)`,
                    maskImage: `linear-gradient(to right, black, white)`,
                    WebkitMaskImage: `linear-gradient(to right, black, white)`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, black, transparent), linear-gradient(to left, transparent, white)",
                  }}
                />
                <div
                  className={`absolute w-3 h-3 rounded-full border-2 ${
                    isColorLight ? "border-stone-800" : "border-white"
                  }`}
                  style={{
                    left: `${hoveredHSV.s}%`,
                    top: `${100 - hoveredHSV.v}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              {/* Hue bar */}
              <div className="relative w-24 h-4  rounded-b-md overflow-hidden shadow-inner">
                {/* Gradient bar */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
                  }}
                />
                {/* Pointer */}
                <div
                  className="absolute top-1/2 w-[2px] h-4 bg-white"
                  style={{
                    left: `${(hoveredHSV.h / 360) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              {/* <div className="absolute top-0 left-[-4.5rem] text-xs font-mono text-stone-200 leading-tight space-y-0.5">
                <p>H: {hoveredHSV.h}°</p>
                <p>S: {hoveredHSV.s}%</p>
                <p>V: {hoveredHSV.v}%</p>
              </div> */}
            </div>
          )}
          {eyedropperPos && (
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
          )}
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
        <button
          onClick={() => {
            setIsFlipped((g) => !g);
            // setGreyscaleClicked(true);
            // setTimeout(() => setGreyscaleClicked(false), 400); // match animation duration
          }}
          title="Flip Horizontally"
          className={`p-2 rounded-lg cursor-pointer hover:text-accent hover:scale-110 active:scale-95 group transition-all  ${
            isFlipped ? "bg-white text-stone-800/80" : ""
          }`}
        >
          <FaArrowsAltH className={`transition-transform duration-400`} />
        </button>
      </div>

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
