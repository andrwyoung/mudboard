import { useFreeformStore } from "@/store/freeform-store";
import { useRef } from "react";

export function useCanvasPointerControls({
  sectionId,
  isActive,
  setIsDragging,
}: {
  sectionId: string;
  isActive: boolean;
  setIsDragging: (isDrag: boolean) => void;
}) {
  const isDraggingRef = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  function onMouseDown(e: React.MouseEvent) {
    if (!isActive) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDraggingRef.current || !isActive) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    useFreeformStore.getState().setCameraForSection(sectionId, (prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }

  function onMouseUp() {
    isDraggingRef.current = false;
    setIsDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  return { onMouseDown };
}
