import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useEyedropper(
  imageBlock: MudboardImage,
  selectedBlock: Block,
  initialSize: { width: number; height: number } | null,
  zoomLevel: number,
  isFlipped: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

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
    const hex = `#${[r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
    setHoveredColor(hex);
  }

  function handleEyedropClick() {
    if (!hoveredColor) return;
    const hexUpper = hoveredColor.toUpperCase();
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
  };
}
