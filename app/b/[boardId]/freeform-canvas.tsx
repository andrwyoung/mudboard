"use client";

import { useFreeformStore } from "@/store/freeform-store";
import { useEffect, useState } from "react";
import { Block } from "@/types/block-types";
import { mainCanvasRef } from "@/store/ui-store";
import { useCanvasPointerControls } from "@/hooks/freeform/use-canvas-pointer-controls";
import { useCanvasZoom } from "@/hooks/freeform/use-freeform-zoom";
import { BlockRenderer } from "@/components/freeform-canvas/block-renderer";
import { Section } from "@/types/board-types";
import { FreeformEditToggleSlider } from "@/components/freeform-canvas/edit-toggle";
import { FaExpand, FaQuestion } from "react-icons/fa6";
import HelpModal from "@/components/modals/help-modal";
import FreeformPreferenceModal from "@/components/modals/freeform-preference-modal";
import {
  DEFAULT_ARRANGE_BG_COLOR,
  DEFAULT_VIEW_BG_COLOR,
} from "@/types/constants";
import { useUserPreferenceStore } from "@/store/use-preferences-store";
import { getFitToScreenCamera } from "@/lib/freeform/get-default-camera";
import { FitCameraToScreen } from "@/lib/freeform/fit-camera-to-screen";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMarque } from "@/hooks/gallery/use-marque";
import { MarqueBox } from "@/components/board/marque";
import MultiSelectBorder from "@/components/freeform-canvas/multi-select-border";
import { MdAutoAwesomeMosaic } from "react-icons/md";
import { runAutoLayoutWithClustering } from "@/lib/freeform/autolayout/detect-clusters";
import SectionDownloadButton from "@/components/section/section-icons.tsx/download-button";
import { DroppableFreeformCanvas } from "@/components/drag/droppable-freeform-canvas";

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
  const setEditMode = useFreeformStore((s) => s.setEditMode);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cursorMovementsIsActive = !editMode || (editMode && spaceHeld);

  const camera = useFreeformStore((s) => s.cameraMap[section.section_id]);

  const [marqueRect, setMarqueRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // preferences
  const viewBgColor = useUserPreferenceStore((s) => s.viewBgColor);
  const arrangeBgColor = useUserPreferenceStore((s) => s.arrangeBgColor);

  const { onWheel, zoomCameraCentered } = useCanvasZoom(sectionId);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceHeld(true);

      if (e.key === "e" || e.key === "E") {
        const store = useFreeformStore.getState();
        store.setEditMode(!store.editMode);
        return;
      }

      // // ZOOM IN/OUT
      if (e.key === "=" || e.key === "+") {
        zoomCameraCentered("in");
        return;
      }

      if (e.key === "-" || e.key === "_") {
        zoomCameraCentered("out");
        return;
        // }
      }

      if (e.key === "0") {
        FitCameraToScreen(sectionId);
      }

      if (e.key === "a" || e.key === "A") {
        if (editMode) runAutoLayoutWithClustering(blocks, sectionId);
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
  }, [zoomCameraCentered, sectionId, editMode, blocks]);

  useEffect(() => {
    if (camera) return;

    const el = mainCanvasRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const bounds = useFreeformStore
      .getState()
      .getLayoutBoundsForSection(sectionId);

    // if no bounds exist, then just center on canvas
    if (!bounds) {
      useFreeformStore.getState().setCameraForSection(sectionId, {
        x: rect.width / 2,
        y: rect.height / 2,
        scale: 1,
      });
    } else {
      // else we just try to fit the view to zoom
      const defaultCam = getFitToScreenCamera(bounds, rect.width, rect.height);
      useFreeformStore.getState().setCameraForSection(sectionId, defaultCam);
    }
  }, [camera, sectionId]);

  // if the size of the main canvas changes, then react to it
  useEffect(() => {
    const el = mainCanvasRef.current;
    if (!el) return;

    let prevRect = el.getBoundingClientRect();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const newRect = entry.contentRect;

      const deltaX = (newRect.width - prevRect.width) / 2;
      const deltaY = (newRect.height - prevRect.height) / 2;

      const store = useFreeformStore.getState();
      store.setCameraForSection(sectionId, (prevCam) => ({
        ...prevCam,
        x: prevCam.x + deltaX,
        y: prevCam.y + deltaY,
      }));

      prevRect = newRect;
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [sectionId]);

  // hooks
  const { onMouseDown } = useCanvasPointerControls({
    sectionId,
    editMode,
    spaceHeld,
    setIsDragging,
  });

  useMarque({ setMarqueRect, disable: cursorMovementsIsActive });

  return (
    <DroppableFreeformCanvas id="freeform-canvas-dropzone">
      <div className="w-full h-full overflow-hidden relative ">
        {editMode && !spaceHeld && marqueRect && (
          <MarqueBox marqueRect={marqueRect} />
        )}
        <div className="absolute top-4 right-4 z-10">
          <FreeformEditToggleSlider />
        </div>

        <div className="top-4 left-4 flex flex-row gap-2 items-center absolute z-10">
          <h1 className="text-sm text-white font-header translate-y-[1px] font-semibold">
            Freeform Mode
          </h1>
          <FreeformPreferenceModal />
        </div>

        {blocks.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none z-20">
            <h1 className="text-xl font-semibold mb-1">
              No Images in this Section
            </h1>
            <p className="text-sm opacity-75">
              Add images in grid mode or switch to another section
            </p>
          </div>
        )}

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              onMouseDown={onMouseDown}
              data-id="freeform-canvas"
              onWheel={onWheel}
              className={`w-full h-full z-0 relative ${
                isDragging
                  ? "cursor-grabbing"
                  : cursorMovementsIsActive
                  ? "cursor-grab"
                  : "cursor-default"
              }`}
              style={{
                backgroundColor: editMode
                  ? arrangeBgColor ?? DEFAULT_ARRANGE_BG_COLOR
                  : viewBgColor ?? DEFAULT_VIEW_BG_COLOR,
              }}
            >
              {camera && (
                <>
                  {editMode && (
                    <MultiSelectBorder
                      sectionId={sectionId}
                      isPanning={spaceHeld}
                      editMode={editMode}
                    />
                  )}

                  {blocks.map((block) => (
                    <BlockRenderer
                      key={block.block_id}
                      block={block}
                      sectionId={sectionId}
                      editMode={editMode}
                      setEditMode={setEditMode}
                      spacebarDown={spaceHeld}
                      disableResizing={
                        isDragging || spaceHeld || marqueRect !== null
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onClick={() => FitCameraToScreen(sectionId)}>
              Fit to screen
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setEditMode(!editMode)}>
              Change Mode
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-2 items-center">
          {editMode && (
            <button
              type="button"
              onClick={() => runAutoLayoutWithClustering(blocks, sectionId)}
              aria-label="Run auto-layout on blocks"
              title="Auto-layout Blocks (A)"
              className="p-1
           text-white hover:text-accent transition-all duration-200 text-lg cursor-pointer"
            >
              <MdAutoAwesomeMosaic className="size-5" />
            </button>
          )}

          <SectionDownloadButton section={section} />

          <button
            type="button"
            onClick={() => FitCameraToScreen(sectionId)}
            aria-label="Fit canvas to screen"
            title="Fit to screen (0)"
            className=" p-1
           text-white hover:text-accent transition-all duration-200 text-lg cursor-pointer"
          >
            <FaExpand />
          </button>
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
    </DroppableFreeformCanvas>
  );
}
