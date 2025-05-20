import { useCallback, useEffect, useRef } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block } from "@/types/block-types";
import { handleBlockDrop } from "@/lib/drag-handling/handle-block-drop";
import { Section, SectionColumns } from "@/types/board-types";
import { findShortestColumn } from "@/lib/columns/column-helpers";
import { useUIStore } from "@/store/ui-store";
import { PositionedBlock } from "@/types/sync-types";

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
  sections: Section[];
  positionedBlockMap: Map<string, PositionedBlock>;
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
  positionedBlockMap,
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

      console.log(
        "starting drag. here's positioned block map: ",
        positionedBlockMap
      );

      // cache blockRefs map so move doesn't have to recompute
      blockRectsRef.current = new Map();
      document.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const id = el.dataset.id;
        if (id) {
          blockRectsRef.current.set(id, el.getBoundingClientRect());
        }
      });

      const { active, activatorEvent } = event;
      const pos = positionedBlockMap.get(active.id.toString());
      if (pos) {
        const sectionCols = sectionColumns[pos.sectionId];
        const col = sectionCols?.[pos.colIndex];
        const activeImage = col?.[pos.rowIndex];
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

      const id = over.id.toString();

      // SCENARIO 1: we hover over a drop indicator
      if (id.startsWith("drop-")) {
        setDropIndicatorId(id);
        return;
      }

      // SCENARIO 2: we hover over a column itself
      const colMatch = String(id).match(
        /^col-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d+)$/
      );
      if (colMatch) {
        const sectionId = colMatch[1];
        const colIndex = Number(colMatch[2]);

        // We'll just drop at the end of this column
        const col = sectionColumns[sectionId]?.[colIndex];
        const insertIndex = col?.length ?? 0;

        const dropId = `drop-${sectionId}-${colIndex}-${insertIndex}`;
        if (dropId !== overIdRef.current) {
          setDropIndicatorId(dropId);
        }
        return;
      }

      // SCENARIO 3: we hover over another block
      const pos = positionedBlockMap.get(String(over.id));
      if (!pos) return;

      const startY = initialPointerYRef.current;
      if (startY == null) return;

      const currentPointerY = startY + delta.y;
      const middleY = rect.top + rect.height / 2;

      const dropId =
        currentPointerY < middleY
          ? `drop-${pos.sectionId}-${pos.colIndex}-${pos.rowIndex}`
          : `drop-${pos.sectionId}-${pos.colIndex}-${pos.rowIndex + 1}`;

      if (dropId !== overIdRef.current) {
        setDropIndicatorId(dropId);
      }
    },
    [positionedBlockMap, setDropIndicatorId]
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

      console.log("drop match: ", dropMatch);

      // first we deal with block reorganization
      if (dropMatch) {
        const toSectionId = String(dropMatch[1]);
        const toColumnIndex = Number(dropMatch[2]);
        const insertIndex = Number(dropMatch[3]);

        handleBlockDrop({
          activeId,
          positionedBlockMap,
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

        const result = getMovingItem(
          activeId,
          positionedBlockMap,
          sectionColumns
        );
        if (!result) return;
        const { item: movingItem, fromPos } = result;

        if (movingItem.section_id === targetSection.section_id) {
          return;
        }

        updateSections({
          [fromPos.sectionId]: (prev) => {
            const cols = [...prev];
            const fromCol = [...cols[fromPos.colIndex]];
            fromCol.splice(fromPos.rowIndex, 1);
            cols[fromPos.colIndex] = fromCol;
            return cols;
          },
          [targetSection.section_id]: (prev) => {
            const toColIndex = findShortestColumn(targetSection.section_id);
            const toCol = [
              ...prev[toColIndex],
              {
                ...movingItem,
                section_id: targetSection.section_id,
              },
            ];
            const newCols = prev.map((col, i) =>
              i === toColIndex ? toCol : col
            );
            return newCols;
          },
        });
      }

      setDropIndicatorId(null);
    },
    [
      positionedBlockMap,
      dropIndicatorId,
      updateSections,
      sectionColumns,
      setDraggedBlock,
    ]
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
