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
import { SectionColumns } from "@/types/board-types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useResetState } from "./user-reset-state";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useLayoutStore } from "@/store/layout-store";

export function useInitBoard(
  boardId: string,
  setIsExpired: (s: boolean) => void,
  setWelcomeModalOpen: (s: boolean) => void
) {
  const setBoardSections = useMetadataStore((s) => s.setBoardSections);
  const setBoard = useMetadataStore((s) => s.setBoard);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);

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

        if (
          board.expired_at &&
          new Date(board.expired_at) <= new Date() &&
          board.user_id === null
        ) {
          setIsExpired(true);
        }

        if (board.is_demo && board.user_id === null) {
          setWelcomeModalOpen(true);
        }

        //
        // 2: grab the sections and figure that out
        //

        let boardSections = await fetchSupabaseSections(boardId);

        // please never happen lol
        if (boardSections.length === 0) {
          console.error("ERROR: No sections, creating one");
          const user = useMetadataStore.getState().user;

          const fallback = await createSupabaseSection({
            board_id: boardId,
            order_index: 0,
            claimedBy: user?.id ?? null,
          });
          boardSections = [fallback];
        }
        console.log("Got sections: ", boardSections);

        // set sections and selectedSection
        setBoardSections(boardSections);
        setSelectedSection(boardSections[0]);

        //
        // 3: grab blocks from supabase. and now that we have
        // everything, we can generate the colums
        //
        const sections = boardSections.map((bs) => bs.section);

        const sectionIds = sections.map((s) => s.section_id);
        const blocksBySection = await fetchSupabaseBlocks(sectionIds);

        const initColumns: SectionColumns = {};
        for (const section of sections) {
          initColumns[section.section_id] = generateInitColumnsFromBlocks(
            blocksBySection[section.section_id] ?? [],
            section.saved_column_num
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
  }, [boardId, setBoardSections, setBoard, setSelectedSection]);
}
