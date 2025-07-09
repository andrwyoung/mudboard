"use client";

import { useFreeformStore } from "@/store/freeform-store";
import { useEffect, useState } from "react";
import { Block } from "@/types/block-types";
import { canvasRef } from "@/store/ui-store";
import FreeformEditToggle from "@/components/freeform-canvas/edit-toggle";
import { useCanvasPointerControls } from "@/hooks/freeform/use-canvas-pointer-controls";
import { useCanvasZoom } from "@/hooks/freeform/use-freeform-zoom";
import { BlockRenderer } from "@/components/freeform-canvas/block-renderer";
import { Section } from "@/types/board-types";

export default function FreeformCanvas({
  blocks,
  section,
}: {
  blocks: Block[];
  section: Section;
}) {
  const sectionId = section.section_id;

  const editMode = useFreeformStore((s) => s.editMode);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cursorMovementsIsActive = !editMode || (editMode && spaceHeld);

  const camera = useFreeformStore((s) => s.cameraMap[section.section_id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceHeld(true);

      if (e.key === "e" || e.key === "E") {
        const store = useFreeformStore.getState();
        store.setEditMode(!store.editMode);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceHeld(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (camera) return;

    const el = canvasRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    useFreeformStore.getState().setCameraForSection(sectionId, {
      x: centerX,
      y: centerY,
      scale: 1,
    });
  }, [camera, sectionId]);

  // hooks
  const { onMouseDown } = useCanvasPointerControls({
    sectionId,
    isActive: cursorMovementsIsActive,
    setIsDragging,
  });

  const { onWheel } = useCanvasZoom(sectionId);

  return (
    <div
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      className={`w-full h-full relative overflow-hidden ${
        cursorMovementsIsActive
          ? isDragging
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default"
      }`}
      style={{ backgroundColor: "#505762" }}
    >
      <div className="absolute top-4 left-4 z-100">
        <FreeformEditToggle />
      </div>

      {camera &&
        blocks.map((block) => (
          <BlockRenderer
            key={block.block_id}
            block={block}
            sectionId={sectionId}
            editMode={editMode}
            spacebarDown={spaceHeld}
          />
        ))}
    </div>
  );
}
