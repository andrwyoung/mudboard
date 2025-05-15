import { useCallback, useEffect, useRef } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block, Section } from "@/types/block-types";
import { handleBlockDrop } from "@/lib/drag-handling/handle-block-drop";
import { updateBlockSectionId } from "@/lib/db-actions/update-block-section";
import { toast } from "sonner";
import { SectionColumns } from "@/types/board-types";
import { findShortestColumn } from "@/lib/columns/column-helpers";
import { useUIStore } from "@/store/ui-store";

export function getMovingItem(
  activeId: string,
  blockMap: Map<
    string,
    { sectionId: string; colIndex: number; blockIndex: number }
  >,
  sectionColumns: SectionColumns
) {
  const fromPos = blockMap.get(activeId);
  if (!fromPos) return null;

  const fromCols = sectionColumns[fromPos.sectionId];
  const item = fromCols?.[fromPos.colIndex]?.[fromPos.blockIndex];
  if (!item) return null;

  return {
    item,
    fromPos,
    fromSectionId: fromPos.sectionId,
    fromColumnIndex: fromPos.colIndex,
    movingItemIndex: fromPos.blockIndex,
  };
}

type UseGalleryHandlersProps = {
  sectionColumns: SectionColumns;
  sections: Section[];
  blockMap: Map<
    string,
    { sectionId: string; colIndex: number; blockIndex: number }
  >;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
  setDraggedBlock: (img: Block | null) => void;
  dropIndicatorId: string | null;
  setDropIndicatorId: (id: string | null) => void;
  setSelectedBlocks: React.Dispatch<
    React.SetStateAction<Record<string, Block>>
  >;
  initialPointerYRef: React.RefObject<number | null>;
};

export function useGalleryHandlers({
  sectionColumns,
  sections,
  blockMap,
  updateSections,
  setDraggedBlock,
  dropIndicatorId,
  setDropIndicatorId,
  setSelectedBlocks,
  initialPointerYRef,
}: UseGalleryHandlersProps) {
  // caching for handleDragMove
  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const overIdRef = useRef<string | null>(null);

  useEffect(() => {
    overIdRef.current = dropIndicatorId;
  }, [dropIndicatorId]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      document.body.classList.add("cursor-grabbing");
      setSelectedBlocks({});

      // cache blockRefs map so move doesn't have to recompute
      blockRectsRef.current = new Map();
      document.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const id = el.dataset.id;
        if (id) {
          blockRectsRef.current.set(id, el.getBoundingClientRect());
        }
      });

      const { active, activatorEvent } = event;
      const pos = blockMap.get(active.id.toString());
      if (pos) {
        const sectionCols = sectionColumns[pos.sectionId];
        const col = sectionCols?.[pos.colIndex];
        const activeImage = col?.[pos.blockIndex];
        if (activeImage) {
          setDraggedBlock(activeImage);
        }
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
      const { delta, over } = event;

      if (!over) {
        setDropIndicatorId(null);
        return;
      }

      const rect = blockRectsRef.current.get(over.id.toString());
      if (!rect) return;

      const pos = blockMap.get(String(over.id));
      if (!pos) return;

      const startY = initialPointerYRef.current;
      if (startY == null) return;

      const currentPointerY = startY + delta.y;
      const middleY = rect.top + rect.height / 2;

      const dropId =
        currentPointerY < middleY
          ? `drop-${pos.sectionId}-${pos.colIndex}-${pos.blockIndex}`
          : `drop-${pos.sectionId}-${pos.colIndex}-${pos.blockIndex + 1}`;

      if (dropId !== overIdRef.current) {
        setDropIndicatorId(dropId);
      }
    },
    [blockMap, setDropIndicatorId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      document.body.classList.remove("cursor-grabbing");

      setDraggedBlock(null);
      initialPointerYRef.current = null;

      const { active, over } = event;
      const activeId = active.id.toString();

      const dropMatch = String(dropIndicatorId).match(
        /^drop-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d+)-(\d+)$/
      );
      const sectionMatch = String(over?.id).match(/^section-(\d+)$/);

      console.log("Overid: ", over?.id);

      // first we deal with block reorganization
      if (dropMatch) {
        const toSectionId = String(dropMatch[1]);
        const toColumnIndex = Number(dropMatch[2]);
        const insertIndex = Number(dropMatch[3]);

        handleBlockDrop({
          activeId,
          blockMap,
          sectionColumns,
          updateSections,
          insertIndex,
          toColumnIndex,
          toSectionId,
        });

        // then we handle section matches
      } else if (sectionMatch) {
        const sectionIndex = Number(sectionMatch[1]);
        const targetSection = sections[sectionIndex];

        if (!targetSection) return;

        const result = getMovingItem(activeId, blockMap, sectionColumns);
        if (!result) return;
        const { item: movingItem, fromPos } = result;

        const fromCols = sectionColumns[fromPos.sectionId];
        if (movingItem.section_id === targetSection.section_id) {
          return;
        }

        const updatedBlock = {
          ...movingItem,
          section_id: targetSection.section_id,
        };

        const spacingSize = useUIStore.getState().spacingSize;
        const toCols = sectionColumns[targetSection.section_id];
        const toColIndex = findShortestColumn(toCols, spacingSize);

        const fromCol = [...fromCols[fromPos.colIndex]];
        fromCol.splice(fromPos.blockIndex, 1);
        const updatedFromCols = fromCols.map((col, i) =>
          i === fromPos.colIndex ? fromCol : col
        );
        const updatedToCol = [...toCols[toColIndex], updatedBlock];
        const newCols = toCols.map((col, i) =>
          i === toColIndex ? updatedToCol : col
        );

        updateSections({
          [fromPos.sectionId]: () => updatedFromCols,
          [targetSection.section_id]: () => newCols,
        });
      }

      setDropIndicatorId(null);
    },
    [blockMap, dropIndicatorId, updateSections, sectionColumns, setDraggedBlock]
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
