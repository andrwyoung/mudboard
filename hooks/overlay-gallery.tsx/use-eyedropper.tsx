// everyone's favorite tool

import { Block, MudboardImage } from "@/types/block-types";
import { getImageUrl } from "@/utils/get-image-url";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getLuminance(hex: string): number {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => parseInt(c, 16) / 255);

  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function hexToHSV(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => parseInt(c, 16) / 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v),
  };
}

export function useEyedropper(
  imageBlock: MudboardImage,
  selectedBlock: Block,
  initialSize: { width: number; height: number } | null,
  zoomLevel: number,
  isFlipped: boolean,
  isGreyscale: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const isColorLight = hoveredColor ? getLuminance(hoveredColor) > 0.5 : true;
  const hoveredHSV = hoveredColor ? hexToHSV(hoveredColor) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getImageUrl(imageBlock.image_id, imageBlock.file_ext, "full");

    img.onload = () => {
      if (!selectedBlock.width || !selectedBlock.height) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = selectedBlock.width;
      canvas.height = selectedBlock.height;

      if (isFlipped) {
        // Flip horizontally
        ctx.translate(selectedBlock.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(img, 0, 0, selectedBlock.width, selectedBlock.height);

      if (isFlipped) {
        // Reset transform so it doesn't affect future drawings
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    };
  }, [
    imageBlock.image_id,
    imageBlock.file_ext,
    selectedBlock.width,
    selectedBlock.height,
    isFlipped,
  ]);

  // when the mouse moves in eyedropper mode! then sample
  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const canvas = canvasRef.current;
    if (!canvas || !selectedBlock.width) return;

    const scaleFactorX =
      selectedBlock.width / (initialSize?.width ?? selectedBlock.width);
    const scaleFactorY =
      selectedBlock.height / (initialSize?.height ?? selectedBlock.height);

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
    hoveredColor,
    setHoveredColor,
    onMouseMove,
    handleEyedropClick,
    isColorLight,
    hoveredHSV,
  };
}
