import { useEyedropper } from "@/hooks/overlay-gallery.tsx/use-eyedropper";
import { usePanImage } from "@/hooks/overlay-gallery.tsx/use-pan-image";
import { Block, MudboardImage } from "@/types/block-types";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/utils/get-image-url";
import { useCursorZoom } from "@/hooks/overlay-gallery.tsx/use-cursor-zoom";
import { PINNED_IMAGE_PADDING } from "@/types/constants";

export default function PinnedImageViewer({
  block,
  image,
  initialSize,
  scrollRef,
}: {
  block: Block;
  image: MudboardImage;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  initialSize: {
    width: number;
    height: number;
  };
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const [overlayMode, setOverlayMode] = useState<"drag" | "eyedropper">("drag");
  const [eyedropperPos, setEyedropperPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isGreyscale, setIsGreyscale] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  console.log(eyedropperPos, setIsFlipped, setIsGreyscale);

  const { isDragging } = usePanImage(scrollRef);

  //   const { resetZoom } =
  useCursorZoom(scrollRef, zoomLevel, setZoomLevel);

  const {
    // canvasRef,
    hoveredColor,
    onMouseMove,
    handleEyedropClick,
    // hoveredHSV,
    // isColorLight,
  } = useEyedropper(
    getImageUrl(image.image_id, image.file_ext, "full"),
    block,
    initialSize,
    zoomLevel,
    isFlipped,
    isGreyscale
  );

  useEffect(() => {
    if (!scrollRef.current || !initialSize) return;

    const container = scrollRef.current;
    const scrollX = (container.scrollWidth - container.clientWidth) / 2;
    const scrollY = (container.scrollHeight - container.clientHeight) / 2;
    container.scrollTo(scrollX, scrollY);
  }, [initialSize, scrollRef]);

  return (
    <div
      className="relative"
      style={{
        width: initialSize.width * zoomLevel + PINNED_IMAGE_PADDING * 2, // 400px buffer each side
        height: initialSize.height * zoomLevel + PINNED_IMAGE_PADDING * 2,
      }}
    >
      <div
        className="relative"
        style={{
          width: initialSize.width * zoomLevel,
          height: initialSize.height * zoomLevel,
          transform: `translate(${PINNED_IMAGE_PADDING}px, ${PINNED_IMAGE_PADDING}px)`,
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
        <Image
          src={getImageUrl(image.image_id, image.file_ext, "full")}
          width={block.width}
          height={block.height}
          alt={block.caption ?? image.original_name}
          draggable={false}
          className={`h-full w-full object-contain rounded shadow-lg
                ${isDragging ? "cursor-grabbing" : "cursor-grab"}
                ${overlayMode === "eyedropper" ? "cursor-crosshair" : ""}
                ${isGreyscale ? "grayscale" : ""}
                ${isFlipped ? "transform scale-x-[-1]" : ""}`}
        />
      </div>
    </div>
  );
}
