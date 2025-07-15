// all this logic is just for resizing. the meat is inside the components themselves

"use client";

import { useRef, useState, RefObject } from "react";
import { usePanelStore } from "@/store/panel-store";
import { CollapsedSidebar } from "@/components/sidebar/collapsed-sidebar";
import Sidebar from "@/components/sidebar/full-sidebar";
import { useMeasureStore } from "@/store/ui-store";
import {
  COLLAPSED_SIDEBAR_WIDTH,
  DRAG_THRESHOLD,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/types/constants";

export default function ResizableSidebar({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const width = useMeasureStore((s) => s.sidebarWidth);
  const setWidth = useMeasureStore((s) => s.setSidebarWidth);

  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  const sidebarCollapsed = usePanelStore((s) => s.isCollapsed);
  const setSidebarCollapsed = usePanelStore((s) => s.setIsCollapsed);

  const dragStartX = useRef(0);
  const consideredDrag = useRef(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = Math.abs(e.clientX - dragStartX.current);
    if (deltaX >= DRAG_THRESHOLD) {
      consideredDrag.current = true;
    }

    console.log("deltaX:", deltaX, "width:", width);
    const newWidth = Math.min(
      Math.max(e.clientX, MIN_SIDEBAR_WIDTH),
      MAX_SIDEBAR_WIDTH
    );
    setWidth(newWidth);
  };
  const handleMouseUp = () => {
    if (!consideredDrag.current) {
      setSidebarCollapsed(true);
    }

    isDragging.current = false;
    consideredDrag.current = false;
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const startDragging = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;

    isDragging.current = true;
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: sidebarCollapsed
          ? COLLAPSED_SIDEBAR_WIDTH
          : Math.min(Math.max(width, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH),
      }}
      className="hidden lg:block bg-primary relative h-full select-none"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Resize sidebar"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
          }
        }}
        className={`absolute top-0 right-0 w-1.5 h-full z-50 cursor-col-resize transition-all duration-200 select-none ${
          dragging ? "bg-accent" : "hover:bg-accent"
        }`}
        onMouseDown={(e) => {
          if (sidebarCollapsed) {
            setSidebarCollapsed(false);
            return;
          }
          if (!isDragging.current) {
            startDragging(e);
          }
        }}
        title={sidebarCollapsed ? "Click to Expand" : "Drag to resize"}
      />
      {sidebarCollapsed ? (
        <CollapsedSidebar onExpand={() => setSidebarCollapsed(false)} />
      ) : (
        <Sidebar
          sectionRefs={sectionRefs}
          onCollapse={() => setSidebarCollapsed(true)}
        />
      )}
    </aside>
  );
}
