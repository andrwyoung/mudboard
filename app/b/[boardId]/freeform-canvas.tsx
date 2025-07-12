"use client";

import { useFreeformStore } from "@/store/freeform-store";
import { useEffect, useState } from "react";
import { Block } from "@/types/block-types";
import { canvasRef } from "@/store/ui-store";
import { useCanvasPointerControls } from "@/hooks/freeform/use-canvas-pointer-controls";
import { useCanvasZoom } from "@/hooks/freeform/use-freeform-zoom";
import { BlockRenderer } from "@/components/freeform-canvas/block-renderer";
import { Section } from "@/types/board-types";
import { FreeformEditToggleSlider } from "@/components/freeform-canvas/edit-toggle";
import { FaQuestion } from "react-icons/fa6";
import HelpModal from "@/components/modals/help-modal";

export default function FreeformCanvas({
  blocks,
  section,
}: {
  blocks: Block[];
  section: Section;
}) {
  const sectionId = section.section_id;
  const [helpOpen, setHelpOpen] = useState(false);

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
    editMode,
    spaceHeld,
    setIsDragging,
  });

  const { onWheel } = useCanvasZoom(sectionId);

  return (
    <div className="w-full h-full overflow-hidden relative ">
      <div className="absolute top-4 right-4 z-100">
        <FreeformEditToggleSlider />
      </div>

      <div
        onMouseDown={onMouseDown}
        onWheel={onWheel}
        className={`w-full h-full ${
          isDragging
            ? "cursor-grabbing"
            : cursorMovementsIsActive
            ? "cursor-grab"
            : "cursor-default"
        }`}
        style={{
          backgroundColor: editMode ? "#838383" : "#505050",
        }}
      >
        {camera &&
          blocks.map((block) => (
            <BlockRenderer
              key={block.block_id}
              block={block}
              sectionId={sectionId}
              editMode={editMode}
              spacebarDown={spaceHeld}
              disableResizing={isDragging || spaceHeld}
            />
          ))}
      </div>

      <button
        onClick={() => setHelpOpen(true)}
        type="button"
        title="Help / Support"
        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-1.5 bg-white 
               border-primary text-primary-darker rounded-full hover:border-accent
              shadow hover:bg-accent transition-all duration-200 text-sm cursor-pointer"
      >
        <FaQuestion />
      </button>
      <HelpModal open={helpOpen} setOpen={setHelpOpen} pageNum={2} />
    </div>
  );
}
