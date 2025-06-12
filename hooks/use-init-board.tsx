// this is the hook used to initiaze a board
// O: clear the previous data....this is pretty important
// 1: grab the board itself
// 2: grab the sections (initialize 1 if there's none...which should never be)
// 3: grab all the blocks
// 4: shove blocks into their sections/columns

import { createSupabaseSection } from "@/lib/db-actions/create-new-section";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useResetState } from "./user-reset-state";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useLayoutStore } from "@/store/layout-store";

export function useInitBoard(
  boardId: string,
  setIsExpired: (s: boolean) => void
) {
  const setSections = useMetadataStore((s) => s.setSections);
  const setBoard = useMetadataStore((s) => s.setBoard);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);

  const setNumCols = useUIStore((s) => s.setNumCols);
  const resetState = useResetState();

  const setSectionColumns = useLayoutStore((s) => s.setSectionColumns);
  const regenerateLayout = useLayoutStore((s) => s.regenerateOrdering);

  useEffect(() => {
    async function loadImages() {
      try {
        resetState(); // reset if we're coming from another board

        //
        // 1: grab the board first
        //

        const board = await fetchSupabaseBoard(boardId);
        setBoard(board);
        const initNumCols = board.saved_column_num;
        if (initNumCols) {
          setNumCols(initNumCols);
          // toast(`Number of columns: ${initNumCols}`);
        }

        if (
          board.expired_at &&
          new Date(board.expired_at) <= new Date() &&
          board.user_id === null
        ) {
          setIsExpired(true);
        }

        //
        // 2: grab the sections and figure that out
        //

        let sections = await fetchSupabaseSections(boardId);

        if (sections.length === 0) {
          console.log("No sections, creating one");
          const fallback = await createSupabaseSection({
            board_id: boardId,
            order_index: 0,
          });
          sections = [fallback];
        }
        console.log("Got sections: ", sections);

        setSections(sections);

        // set selected section to the very first one
        const topSection = sections.reduce((min, curr) =>
          (curr.order_index ?? 0) < (min.order_index ?? 0) ? curr : min
        );
        if (topSection) {
          setSelectedSection(topSection);
        }
        console.log("Set sections to:", sections);

        //
        // 3: grab blocks from supabase. and now that we have
        // everything, we can generate the colums
        //

        const blocks = await fetchSupabaseBlocks(boardId);

        const grouped: Record<string, Block[]> = {};
        for (const block of blocks) {
          const key = block.section_id ?? "unassigned";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(block);
        }

        const initColumns: SectionColumns = {};
        for (const section of sections) {
          initColumns[section.section_id] = generateInitColumnsFromBlocks(
            grouped[section.section_id],
            initNumCols
          );
        }

        setSectionColumns(initColumns);
        regenerateLayout();

        // now we genrate the initial layout
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setSections, setBoard, setSelectedSection]);
}
