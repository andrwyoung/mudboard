"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GreyscaleToggleButton } from "@/components/overlay-gallery/edit-buttons/greyscale-button";
import { FlippedToggleButton } from "@/components/overlay-gallery/edit-buttons/mirror-button";
import { EyedropperToggleButton } from "@/components/overlay-gallery/edit-buttons/color-picker/eyedropper-button";
import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";
import GreyscaleWheel from "../overlay-gallery/edit-buttons/color-picker/gs-color-wheel";
import ColorWheel from "../overlay-gallery/edit-buttons/color-picker/color-wheel";
import { toast } from "sonner";

export default function LandingPageDemo() {
  const [isGreyscale, setIsGreyscale] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [eyedropperMode, setEyedropperMode] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });

  const imageUrl = "/screeny3.png";
  const [eyedropperPos, setEyedropperPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    canvasRef,
    hoveredColor,
    onMouseMove,
    handleEyedropClick,
    isColorLight,
    hoveredHSV,
  } = useEyedropper(
    imageUrl,
    displayedSize,
    displayedSize,
    1,
    isFlipped,
    isGreyscale
  );

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setDisplayedSize({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center mb-36 gap-2 relative">
      {/* <h2 className="font-semibold text-xl mb-1">Built in Study tools</h2> */}
      <h2 className="font-semibold text-xl mb-1">A Mudboard in the wild</h2>
      {/* <h3 className="text-sm mb-4">Click the icons to try them</h3> */}

      {eyedropperMode && hoveredColor && eyedropperPos && hoveredHSV && (
        <>
          <div className="fixed bottom-4 right-4  hidden sm:block">
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
          </div>
          {/* <div
            className={`absolute bottom-0 right-2 text-sm px-2 py-1 rounded shadow w-28
                ${isColorLight ? "text-stone-700" : "text-white"}`}
            style={{
              backgroundColor: hoveredColor,
            }}
          >
            {hoveredColor.toUpperCase()}
          </div> */}
        </>
      )}
      <div className="flex flex-col gap-2 items-center">
        <div
          className="relative max-w-3xl w-full border-2 border-secondary rounded-lg overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (eyedropperMode && hoveredColor) {
              handleEyedropClick();
              setEyedropperMode(false);
            }
          }}
          onMouseMove={(e) => {
            if (eyedropperMode) {
              onMouseMove(e);
              setEyedropperPos({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseLeave={() => setEyedropperPos(null)}
        >
          <div ref={imageRef}>
            <Image
              src={imageUrl}
              alt="Demo image"
              width={2048}
              height={1378}
              className={`w-full h-auto object-contain ${
                eyedropperMode ? "cursor-crosshair" : ""
              }
                ${isGreyscale ? "grayscale" : ""} 
                ${isFlipped ? "scale-x-[-1]" : ""}`}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h3 className="text-sm">Click the icons to explore this specimen:</h3>
          <div className="flex flex-row gap-2">
            <EyedropperToggleButton
              isEyedropperActive={eyedropperMode}
              onToggle={() => {
                if (!eyedropperMode) {
                  toast.success("Eyedropper active. Click image to copy HEX");
                }
                setEyedropperMode((v) => !v);
              }}
            />
            <GreyscaleToggleButton
              isGreyscale={isGreyscale}
              onToggle={() => setIsGreyscale((v) => !v)}
            />
            <FlippedToggleButton
              isFlipped={isFlipped}
              onToggle={() => setIsFlipped((v) => !v)}
            />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef} //
        width={displayedSize.width}
        height={displayedSize.height}
        style={{ display: "none", visibility: "hidden" }} // hidden: just used for eyedropper
      />
    </div>
  );
}
