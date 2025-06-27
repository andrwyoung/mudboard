"use client";

import { useLoadingStore } from "@/store/loading-store";
import { useDroppable } from "@dnd-kit/core";
import { useRef, useState, useEffect } from "react";

export default function ResizablePinnedPanel({
  initialWidth = 1200,
  minWidth = 400,
  maxWidth = 6000,
  children,
  dndId,
}: {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
  dndId?: string;
}) {
  const [width, setWidth] = useState(initialWidth);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);
  const setShowBlurImg = useLoadingStore((s) => s.setShowBlurImg);

  const startX = useRef(0);
  const startWidth = useRef(0);

  const { setNodeRef, isOver } = useDroppable({
    id: dndId ?? "__undefined__",
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(
        Math.max(startWidth.current - delta, minWidth),
        maxWidth
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setDragging(false);
      setShowBlurImg(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minWidth, maxWidth, setShowBlurImg]);

  const startDragging = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    setShowBlurImg(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; // disable text selection

    startX.current = e.clientX;
    startWidth.current = width;
  };

  return (
    <div
      ref={(el) => {
        panelRef.current = el;
        setNodeRef(el);
      }}
      data-id={dndId}
      className={`relative h-full select-none`}
      style={{ width }}
    >
      {/* Highlight when hovered over */}
      {dndId && (
        <div
          className={`absolute inset-0 z-100 opacity-50  ${
            isOver ? "bg-accent" : "hidden"
          } `}
        />
      )}
      {/* Resizer sliver */}
      <div
        onMouseDown={startDragging}
        className={`absolute top-0 left-0 -translate-x-1/2 w-1.5 h-full 
            cursor-col-resize z-50 transition-all duration-200 select-none
         ${dragging ? "bg-accent" : "hover:bg-accent"}`}
        title="Drag to resize"
      />
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
