// this monster hook is the file that handles all the drag and drop
// behavior of dragging and rearranging blocks

import { useCallback, useEffect, useRef } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block } from "@/types/block-types";
import { handleBlockDrop } from "@/lib/drag-handling/handle-block-drop";
import { BoardSection, Section, SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";
import { handleSectionDrop } from "@/lib/drag-handling/handle-section-drop";
import { MAX_DRAGGED_ITEMS } from "@/types/upload-settings";
import { usePanelStore } from "@/store/panel-store";
import { cloneBlocksToSection } from "@/lib/drag-handling/handle-clone-section-drop";
import { handleClonedBlockDrop } from "@/lib/drag-handling/handle-clone-block-drop";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import { useDragStore } from "@/store/drag-store";
import { useSelectionStore } from "@/store/selection-store";

export function getMovingItem(
  activeId: string,
  positionedBlockMap: Map<string, PositionedBlock>,
  sectionColumns: SectionColumns
) {
  const fromPos = positionedBlockMap.get(activeId);
  if (!fromPos) return null;

  const fromCols = sectionColumns[fromPos.sectionId];
  const item = fromCols?.[fromPos.colIndex]?.[fromPos.rowIndex];
  if (!item) return null;

  return {
    item,
    fromPos,
    fromSectionId: fromPos.sectionId,
    fromColumnIndex: fromPos.colIndex,
    movingItemIndex: fromPos.rowIndex,
  };
}

type UseGalleryHandlersProps = {
  sectionColumns: SectionColumns;
  boardSections: BoardSection[];
  positionedBlockMap: Map<string, PositionedBlock>;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
  draggedBlocks: Block[] | null;
  setDraggedBlocks: (img: Block[] | null) => void;
  deselectBlocks: () => void;
  initialPointerYRef: React.RefObject<number | null>;
};

export function useGalleryHandlers({
  sectionColumns,
  boardSections,
  positionedBlockMap,
  updateSections,
  draggedBlocks,
  setDraggedBlocks,
  deselectBlocks,
  initialPointerYRef,
}: UseGalleryHandlersProps) {
  // caching for handleDragMove
  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const overIdRef = useRef<string | null>(null);

  const dropIndicatorId = useDragStore((s) => s.dropIndicatorId);
  const setDropIndicatorId = useDragStore((s) => s.setDropIndicatorId);

  useEffect(() => {
    overIdRef.current = dropIndicatorId;
  }, [dropIndicatorId]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const target = event.activatorEvent?.target as HTMLElement | null;

      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("input, textarea, [contenteditable='true']"))
      ) {
        return; // Cancel drag if starting from an input or textarea
      }

      document.body.classList.add("cursor-grabbing");
      // deselectBlocks();

      // cache blockRefs map so move doesn't have to recompute
      blockRectsRef.current = new Map();
      document.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const id = el.dataset.id;
        if (id) {
          blockRectsRef.current.set(id, el.getBoundingClientRect());
        }
      });

      const { active, activatorEvent } = event;
      const rawId = active.id.toString();
      const isMirror = rawId.startsWith("mirror");
      const rawBlockId = rawId.match(/^[^:]+::block-(.+)$/)?.[1] ?? "";

      let initDraggedBlock: Block | undefined = undefined;
      if (!isMirror) {
        initDraggedBlock = positionedBlockMap.get(rawBlockId)?.block;
      } else {
        // if it's in the mirror side, then we need to grab from the explore panel
        const results = useSecondaryLayoutStore
          .getState()
          .getBlocks([rawBlockId]);
        if (results.length === 1) {
          initDraggedBlock = results[0];
        }
      }

      const selectedBlocks = useSelectionStore.getState().selectedBlocks;

      if (!initDraggedBlock || !selectedBlocks) return;

      const isSelected = !!selectedBlocks?.[rawBlockId];

      // if not selected already, then we're just dragging this block
      if (!isSelected) {
        setDraggedBlocks([initDraggedBlock]);
      } else {
        // but if not then we grab all selected blocks and set them to drag
        const selectedIds = Object.keys(selectedBlocks);

        let draggedGroup: Block[];
        if (!isMirror) {
          draggedGroup = selectedIds
            .map((id) => positionedBlockMap.get(id)?.block)
            .filter((b): b is Block => Boolean(b));
        } else {
          draggedGroup = useSecondaryLayoutStore
            .getState()
            .getBlocks(selectedIds);
        }

        setDraggedBlocks(draggedGroup);
      }

      if (activatorEvent instanceof MouseEvent) {
        initialPointerYRef.current = activatorEvent.clientY;
      } else if (activatorEvent instanceof TouchEvent) {
        initialPointerYRef.current = activatorEvent.touches[0]?.clientY ?? null;
      }
    },
    [sectionColumns]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { delta, over, active } = event;

      if (!active.data.current?.canEdit && !active.data.current?.isMirror)
        return;

      if (!over) {
        setDropIndicatorId(null);
        return;
      }

      const rect = blockRectsRef.current.get(over.id.toString());

      const fullId = over.id.toString();
      const idMatch = fullId.split("::");
      const scope = idMatch[0];
      const unscopedId = idMatch[1];

      console.log("full over Id: ", fullId);

      if (!unscopedId || !rect) {
        setDropIndicatorId(null);
        return;
      }

      // SCENARIO 1: we hover over a drop indicator
      if (unscopedId.startsWith("drop-")) {
        setDropIndicatorId(fullId);
        return;
      }

      // SCENARIO 2: we hover over a column itself
      const colMatch = String(unscopedId).match(
        /^col-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d+)$/
      );
      if (colMatch) {
        const sectionId = colMatch[1];
        const colIndex = Number(colMatch[2]);

        // We'll just drop at the end of this column
        const col = sectionColumns[sectionId]?.[colIndex];
        const insertIndex = col?.length ?? 0;

        const dropId = `${scope}::drop-${sectionId}-${colIndex}-${insertIndex}`;
        if (dropId !== overIdRef.current) {
          setDropIndicatorId(dropId);
        }
        return;
      }

      // SCENARIO 3: we hover over another block
      const blockId = fullId.match(/^[^:]+::block-(.+)$/)?.[1];
      const pos = positionedBlockMap.get(blockId ?? "");
      if (!pos) return;

      const startY = initialPointerYRef.current;
      if (startY == null) return;

      const currentPointerY = startY + delta.y;
      const middleY = rect.top + rect.height / 2;

      const dropId =
        currentPointerY < middleY
          ? `${scope}::drop-${pos.sectionId}-${pos.colIndex}-${pos.rowIndex}`
          : `${scope}::drop-${pos.sectionId}-${pos.colIndex}-${
              pos.rowIndex + 1
            }`;

      if (dropId !== overIdRef.current) {
        setDropIndicatorId(dropId);
      }
    },
    [positionedBlockMap, setDropIndicatorId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      document.body.classList.remove("cursor-grabbing");

      initialPointerYRef.current = null;

      const { active, over } = event;
      const rawId = active.id.toString();
      const canEdit = active.data.current?.canEdit;
      const cloneBlock = !canEdit;
      const activeId = rawId.match(/^[^:]+::block-(.+)$/)?.[1] ?? "";

      console.log("cloneBlock is ", cloneBlock, "canEdit field: ", canEdit);

      // convert all draggedBlocks into positionedBlocks
      if (!draggedBlocks) return;
      const activeBlocksWithPos: PositionedBlock[] =
        draggedBlocks
          ?.map((block) => positionedBlockMap.get(block.block_id))
          .filter((b): b is PositionedBlock => b != null) ?? [];

      if (
        over?.id === "pinned-panel-dropzone" &&
        activeBlocksWithPos[0].block.block_type === "image"
      ) {
        usePanelStore.getState().setPinnedBlock(activeBlocksWithPos[0].block);
      }

      const unscopedDropId = String(dropIndicatorId).split("::")[1] ?? "";
      const dropMatch = unscopedDropId.match(
        /^drop-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d+)-(\d+)$/
      );
      const sectionMatch = String(over?.id).match(/^section-(\d+)$/);

      console.log("Overid: ", over?.id);
      console.log("drop match: ", dropMatch);
      console.log("ActiveId ", activeId);

      // helper function
      function handleSectionLevelDrop(targetSection: Section) {
        if (cloneBlock) {
          cloneBlocksToSection({
            blocks: draggedBlocks ?? [],
            sectionColumns,
            updateSections,
            targetSection,
          });
        } else {
          handleSectionDrop({
            activeBlocksWithPos,
            sectionColumns,
            updateSections,
            targetSection,
          });
        }
      }

      // first we deal with block reorganization
      if (dropMatch) {
        const toSectionId = String(dropMatch[1]);
        const toColumnIndex = Number(dropMatch[2]);
        const insertIndex = Number(dropMatch[3]);

        console.log("dragged blocks len, ", draggedBlocks.length);

        // the case where we're dragging too many blocks
        if (draggedBlocks.length > MAX_DRAGGED_ITEMS) {
          const targetSection = boardSections.find(
            (bs) => bs.section.section_id === toSectionId
          )?.section;
          if (!targetSection) return;

          handleSectionLevelDrop(targetSection);
          setDraggedBlocks(null);
          return;
        }

        if (cloneBlock) {
          handleClonedBlockDrop({
            block: draggedBlocks[0],
            toSectionId,
            toColumnIndex,
            insertIndex,
            updateSections,
          });
        } else {
          handleBlockDrop({
            activeBlockWithPos: activeBlocksWithPos[0],
            updateSections,
            insertIndex,
            toColumnIndex,
            toSectionId,
          });
        }

        // special case: freeform canvas dropzone
      } else if (over?.id === "freeform-canvas-dropzone") {
        const selectedSection = useSelectionStore.getState().selectedSection;
        if (selectedSection) {
          handleSectionLevelDrop(selectedSection.section);
        }

        // then we handle section matches
      } else if (sectionMatch) {
        const sectionIndex = Number(sectionMatch[1]);
        const targetSection = boardSections[sectionIndex].section;

        handleSectionLevelDrop(targetSection);
      }

      setDraggedBlocks(null);
      setDropIndicatorId(null);
      deselectBlocks();
    },
    [
      positionedBlockMap,
      dropIndicatorId,
      updateSections,
      sectionColumns,
      setDraggedBlocks,
    ]
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
