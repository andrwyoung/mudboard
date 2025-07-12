import { useFreeformStore } from "@/store/freeform-store";
import { useRef, useState } from "react";

export function useCanvasPointerControls({
  sectionId,
  editMode,
  spaceHeld,
  setIsDragging,
}: {
  sectionId: string;
  editMode: boolean;
  spaceHeld: boolean;
  setIsDragging: (isDrag: boolean) => void;
}) {
  const isDraggingRef = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  let timeoutId: number | null = null;

  function onMouseDown(e: React.MouseEvent) {
    const isMiddleMouse = e.button === 1;
    const isLeftMouse = e.button === 0;

    // Block all other buttons
    if (!isLeftMouse && !isMiddleMouse) return;

    // Left click conditions: only allow drag if appropriate
    if (isLeftMouse) {
      const validLeftClick = !editMode || (editMode && spaceHeld);
      if (!validLeftClick) return;
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };

    const pressStart = performance.now();

    function handleMouseMove(moveEvent: MouseEvent) {
      if (!isDraggingRef.current) return;

      const dx = moveEvent.clientX - lastMouse.current.x;
      const dy = moveEvent.clientY - lastMouse.current.y;
      lastMouse.current = { x: moveEvent.clientX, y: moveEvent.clientY };

      useFreeformStore.getState().setCameraForSection(sectionId, (prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }

    function handleMouseUp() {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // Only handle middle mouse logic
      if (isMiddleMouse) {
        const pressDuration = performance.now() - pressStart;
        if (pressDuration < 200) {
          // Treat as tap — toggle edit mode
          const store = useFreeformStore.getState();
          store.setEditMode(!store.editMode);
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return { onMouseDown };
}
