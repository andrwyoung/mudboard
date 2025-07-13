// everyone's favorite tool

import {
  getLuminanceFromHex,
  hexToHSV,
} from "@/lib/color-picker/color-converters";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useEyedropper(
  imageUrl: string,
  blockDimensions: { width?: number; height: number },
  initialSize: { width: number; height: number } | null,
  zoomLevel: number,
  isFlipped: boolean,
  isGreyscale: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const isColorLight = hoveredColor
    ? getLuminanceFromHex(hoveredColor) > 0.5
    : true;
  const hoveredHSV = hoveredColor ? hexToHSV(hoveredColor) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      if (!blockDimensions.width || !blockDimensions.height) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = blockDimensions.width;
      canvas.height = blockDimensions.height;

      if (isFlipped) {
        // Flip horizontally
        ctx.translate(blockDimensions.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, 0, 0, blockDimensions.width, blockDimensions.height);

      if (isFlipped) {
        // Reset transform so it doesn't affect future drawings
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    };
  }, [blockDimensions.width, blockDimensions.height, isFlipped]);

  // when the mouse moves in eyedropper mode! then sample
  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const canvas = canvasRef.current;
    if (!canvas || !blockDimensions.width) return;

    const scaleFactorX =
      blockDimensions.width / (initialSize?.width ?? blockDimensions.width);
    const scaleFactorY =
      blockDimensions.height / (initialSize?.height ?? blockDimensions.height);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / zoomLevel) * scaleFactorX);
    const y = Math.floor(((e.clientY - rect.top) / zoomLevel) * scaleFactorY);

    const ctx = canvas.getContext("2d");
    const pixel = ctx?.getImageData(x, y, 1, 1).data;
    if (!pixel) return;

    const [r, g, b] = pixel;
    const hex = isGreyscale
      ? (() => {
          const v = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b); // luminance
          const greyHex = v.toString(16).padStart(2, "0");
          return `#${greyHex}${greyHex}${greyHex}`;
        })()
      : `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    setHoveredColor(hex);
  }

  function handleEyedropClick() {
    if (!hoveredColor) return;
    const hexUpper = hoveredColor.replace("#", "").toUpperCase();
    navigator.clipboard.writeText(hexUpper).then(() => {
      toast.success(`Copied ${hexUpper} to Clipboard`);
    });
  }

  return {
    canvasRef,
    blockDimensions,
    hoveredColor,
    setHoveredColor,
    onMouseMove,
    handleEyedropClick,
    isColorLight,
    hoveredHSV,
  };
}
