import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";
import NextImage from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaEyeDropper, FaXmark } from "react-icons/fa6";
import { useOverlayStore } from "@/store/overlay-store";
import { toast } from "sonner";

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

  // eyedropper stuff
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const [overlayMode, setOverlayMode] = useState<OverlayModes>("drag");

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

  /// zoooming
  const zoomAtCenter = useCallback(
    (zoomFn: (prev: number) => number) => {
      const container = scrollContainerRef.current;
      if (!container || !initialSize) return;

      const prevZoom = zoomLevel;
      const newZoom = zoomFn(prevZoom);
      if (newZoom === prevZoom) return;

      const rect = container.getBoundingClientRect();
      const centerX = container.scrollLeft + rect.width / 2;
      const centerY = container.scrollTop + rect.height / 2;
      const ratio = newZoom / prevZoom;

      setZoomLevel(newZoom);

      // Adjust scroll so center stays in view
      requestAnimationFrame(() => {
        container.scrollLeft = centerX * ratio - rect.width / 2;
        container.scrollTop = centerY * ratio - rect.height / 2;
      });
    },
    [zoomLevel, initialSize]
  );

  const zoomIn = useCallback(() => {
    zoomAtCenter((z) => Math.min(z + 0.1, 3));
  }, [zoomAtCenter]);

  const zoomOut = useCallback(() => {
    zoomAtCenter((z) => Math.max(z - 0.1, 0.1));
  }, [zoomAtCenter]);
  const resetZoom = () => setZoomLevel(1);

  // scroll wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1; // up = zoom in, down = zoom out

        if (direction > 0) zoomIn();
        else zoomOut();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoomIn, zoomOut]);

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
  }, [closeOverlayGallery, zoomIn, zoomOut]);

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

  // draw the image so we can use it for the eyedropper
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getImageUrl(imageBlock.image_id, imageBlock.file_ext, "full");

    img.onload = () => {
      ctx.drawImage(img, 0, 0, imageBlock.width, selectedBlock.height);
    };
  }, [
    imageBlock.image_id,
    imageBlock.file_ext,
    imageBlock.width,
    selectedBlock.height,
  ]);

  // when the mouse moves in eyedropper mode! then sample
  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (overlayMode !== "eyedropper") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleFactorX =
      imageBlock.width / (initialSize?.width ?? imageBlock.width);
    const scaleFactorY =
      selectedBlock.height / (initialSize?.height ?? selectedBlock.height);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / zoomLevel) * scaleFactorX);
    const y = Math.floor(((e.clientY - rect.top) / zoomLevel) * scaleFactorY);

    const ctx = canvas.getContext("2d");
    const pixel = ctx?.getImageData(x, y, 1, 1).data;
    if (!pixel) return;

    const [r, g, b] = pixel;
    const hex = `#${[r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
    setHoveredColor(hex);
  }

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
                  navigator.clipboard.writeText(hoveredColor).then(() => {
                    console.log("Copied to clipboard:", hoveredColor);
                    toast.success(`Copied ${hoveredColor} to Clipboard`);
                    setOverlayMode("drag");
                  });
                }
              }}
              onMouseMove={onMouseMove}
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
          onClick={() =>
            setOverlayMode((m) => (m === "drag" ? "eyedropper" : "drag"))
          }
          className={`cursor-pointer hover:text-accent hover:bg-white transition-all p-2 rounded-lg ${
            overlayMode === "eyedropper" ? "bg-white text-stone-800/80" : ""
          }`}
        >
          <FaEyeDropper />
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
