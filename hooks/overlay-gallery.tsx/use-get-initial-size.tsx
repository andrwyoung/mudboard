import { Block } from "@/types/block-types";
import { useLayoutEffect } from "react";

export function useGetInitialSizeOnLayout(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  block: Block | null,
  setInitialSize: (size: { width: number; height: number }) => void
) {
  useLayoutEffect(() => {
    if (!block || !block.width || !block.height || !scrollRef.current) return;

    const padding = 24 * 4;
    const container = scrollRef.current;

    const containerWidth = container.clientWidth - padding;
    const containerHeight = container.clientHeight - padding;

    const imageAspect = block.width / block.height;
    const containerAspect = containerWidth / containerHeight;

    if (imageAspect > containerAspect) {
      const width = containerWidth;
      const height = width / imageAspect;
      setInitialSize({ width, height });
    } else {
      const height = containerHeight;
      const width = height * imageAspect;
      setInitialSize({ width, height });
    }
  }, [block?.width, block?.height, scrollRef.current]);
}
