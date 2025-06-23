// this is the hook used to initiaze a board
// O: clear the previous data....this is pretty important
// 1: grab the board itself
// 2: grab the sections (initialize 1 if there's none...which should never be)
// 3: grab all the blocks
// 4: shove blocks into their sections/columns

import { createSupabaseBoardSection } from "@/lib/db-actions/create-new-section";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { SectionColumns } from "@/types/board-types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useResetState } from "./user-reset-state";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useLayoutStore } from "@/store/layout-store";
import { useLoadingStore } from "@/store/loading-store";
import { VisualOverride } from "@/types/block-types";
import { usePinnedStore } from "@/store/use-pinned-store";
import { MOBILE_BREAKPOINT, MOBILE_COLUMN_NUMBER } from "@/types/constants";

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
  const regenerateLayout = useLayoutStore(
    (s) => s.regenerateOrderingInternally
  );

  const setBoardInitialized = useLoadingStore((s) => s.setBoardInitialized);
  const resetPinnedView = usePinnedStore((s) => s.reset);

  useEffect(() => {
    async function loadImages() {
      try {
        resetState(); // reset if we're coming from another board
        setBoardInitialized(false);

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
        // set the visualSectionNum so we don't touch the real saved_column_num
        boardSections.forEach((boardSection) => {
          const section = boardSection.section;

          section.visualColumnNum = section.saved_column_num;

          console.log(
            section.is_public,
            section.is_forkable,
            section.is_linkable,
            section.is_on_marketplace,
            section.first_published_at
          );
        });

        // please never happen lol
        if (boardSections.length === 0) {
          console.error("ERROR: No sections, creating one");
          const user = useMetadataStore.getState().user;

          const fallback = await createSupabaseBoardSection({
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

        // populate the gallery overrides
        const setVisualOverride = useLayoutStore.getState().setVisualOverride;
        for (const blocks of Object.values(blocksBySection)) {
          for (const block of blocks) {
            const overrides: Partial<VisualOverride> = {};
            if (block.is_flipped) overrides.is_flipped = block.is_flipped;
            if (block.is_greyscale) overrides.is_greyscale = block.is_greyscale;
            if (block.crop) overrides.crop = block.crop;

            if (Object.keys(overrides).length > 0) {
              setVisualOverride(block.block_id, overrides);
            }
          }
        }

        // generate the columns
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (isMobile) {
          useLayoutStore.setState({ forceMobileColumns: true });
        }

        const initColumns: SectionColumns = {};
        for (const section of sections) {
          initColumns[section.section_id] = generateInitColumnsFromBlocks(
            blocksBySection[section.section_id] ?? [],
            isMobile ? MOBILE_COLUMN_NUMBER : section.saved_column_num
          );
        }

        setSectionColumns(initColumns);
        regenerateLayout();
        setBoardInitialized(true);

        // now we genrate the initial layout
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setBoardSections, setBoard, setSelectedSection]);
}
