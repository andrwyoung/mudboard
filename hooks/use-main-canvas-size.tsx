// UNUSUED

import { useEffect, useRef } from "react";

export function useCanvasSize(ref: React.RefObject<HTMLElement | null>) {
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      sizeRef.current = { width, height };
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return sizeRef;
}
