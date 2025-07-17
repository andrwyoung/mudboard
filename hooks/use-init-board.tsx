// KEY FILE: this is the hook used to initiaze a board

import { createSupabaseBoardSection } from "@/lib/db-actions/create-new-section";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { SectionColumns } from "@/types/board-types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useResetState } from "./use-reset-state";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useLayoutStore } from "@/store/layout-store";
import { useLoadingStore } from "@/store/loading-store";
import { VisualOverride } from "@/types/block-types";
import {
  FREEFROM_DEFAULT_WIDTH,
  MAX_Z_THRESHOLD,
  MOBILE_BREAKPOINT,
  MOBILE_COLUMN_NUMBER,
  Z_INDEX_INCREMENT,
} from "@/types/constants";
import { useUIStore } from "@/store/ui-store";
import { useDemoStore } from "@/store/demo-store";
import {
  FreeformPosition,
  BoundingBox,
  useFreeformStore,
} from "@/store/freeform-store";

export function useInitBoard(
  boardId: string,
  setIsExpired: (s: boolean) => void
) {
  const setBoardSections = useMetadataStore((s) => s.setBoardSections);
  const setBoard = useMetadataStore((s) => s.setBoard);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);

  const resetState = useResetState();

  const setSectionColumns = useLayoutStore((s) => s.setSectionColumns);
  const generatePositionedBlocks = useLayoutStore(
    (s) => s.regenerateOrderingInternally
  );

  const setBoardInitialized = useLoadingStore((s) => s.setBoardInitialized);

  useEffect(() => {
    async function loadImages() {
      try {
        resetState(); // reset if we're coming from another board
        setBoardInitialized(false);

        //
        // STEP 1: grab the board first
        const board = await fetchSupabaseBoard(boardId);
        setBoard(board);

        if (
          // DEPRECATED
          board.expired_at &&
          new Date(board.expired_at) <= new Date() &&
          board.user_id === null
        ) {
          setIsExpired(true);
        }

        // is this a DEMO BOARD
        const isDemo = board.is_demo && board.user_id === null;
        if (isDemo) {
          useDemoStore.getState().setDemoBoardYes();
          useDemoStore.getState().openModal("welcome");
        }

        //
        // STEP 2: grab the sections and figure that out
        //

        let boardSections = await fetchSupabaseSections(boardId);

        // Fallback sort in case Supabase ordering is unreliable
        boardSections.sort((a, b) => a.order_index - b.order_index);

        // set the visual num cols
        const setVisualNumColsForSection =
          useLayoutStore.getState().setVisualNumColsForSection;
        boardSections.forEach((boardSection) => {
          const section = boardSection.section;
          setVisualNumColsForSection(
            section.section_id,
            section.saved_column_num
          );
        });

        // Edge case: please never happen lol
        // TODO: should I throw an error instead?
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

        setBoardSections(boardSections);
        setSelectedSection(boardSections[0]);

        //
        // STEP 3: grab blocks from supabase
        //
        const sections = boardSections.map((bs) => bs.section);

        const sectionIds = sections.map((s) => s.section_id);
        let blocksBySection = await fetchSupabaseBlocks(sectionIds);

        // populate the gallery overrides AND freeform gallery positions
        const setVisualOverride = useLayoutStore.getState().setVisualOverride;
        const positionMap: Record<
          string,
          Record<string, FreeformPosition>
        > = {};

        const topZIndexMap: Record<string, number> = {};
        const layoutBoundsMap: Record<string, BoundingBox> = {};

        for (const [sectionId, blocks] of Object.entries(blocksBySection)) {
          if (blocks.length === 0) continue;

          positionMap[sectionId] = {};

          // measuring init indexes and stuff
          let highestZIndex = 0;
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          for (const block of blocks) {
            const overrides: Partial<VisualOverride> = {};
            if (block.is_flipped) overrides.is_flipped = block.is_flipped;
            if (block.is_greyscale) overrides.is_greyscale = block.is_greyscale;
            if (block.crop) overrides.crop = block.crop;

            if (Object.keys(overrides).length > 0) {
              setVisualOverride(block.block_id, overrides);
            }

            // freeform canvas init
            positionMap[sectionId][block.block_id] = {
              x: block.canvas_x ?? null,
              y: block.canvas_y ?? null,
              z: block.canvas_z ?? 0,
              scale: block.canvas_scale ?? 1,
            };

            // grab the current highest z index
            highestZIndex = Math.max(highestZIndex, block.canvas_z ?? 0);

            // grab the "bounding box" of all the blocks. so we can create a good init camera view
            minX = Math.min(minX, block.canvas_x ?? 0);
            minY = Math.min(minY, block.canvas_y ?? 0);

            const scale = block.canvas_scale ?? 1;
            const width = (block.width ?? FREEFROM_DEFAULT_WIDTH) * scale;
            const height = (block.height ?? 0) * scale;
            const x = block.canvas_x ?? 0;
            const y = block.canvas_y ?? 0;

            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
          }

          // If z-index values have grown too large, reindex them to prevent overflow
          if (highestZIndex > MAX_Z_THRESHOLD) {
            console.log("Z index too high. reindexing");

            // 1. Get positions and sort by z-index
            const positions = Object.entries(positionMap[sectionId]);
            const sorted = positions.sort(
              ([, a], [, b]) => (a.z ?? 0) - (b.z ?? 0)
            );

            // 2. Reassign z-indices in the position map
            sorted.forEach(([blockId], idx) => {
              positionMap[sectionId][blockId].z = idx * Z_INDEX_INCREMENT;
            });
            highestZIndex = (sorted.length - 1) * Z_INDEX_INCREMENT;
          }

          topZIndexMap[sectionId] = highestZIndex;
          layoutBoundsMap[sectionId] = {
            minX,
            minY,
            maxX,
            maxY,
          };
        }
        useFreeformStore.getState().bulkSetPositions(positionMap);
        useFreeformStore.setState({
          topZIndexMap,
          layoutBoundsMap,
        }); // acceptable use of setState

        // STEP 4: generate the columns
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (isMobile) {
          useUIStore.getState().setMobileColumns(true);
        }

        const initColumns: SectionColumns = {};
        for (const section of sections) {
          initColumns[section.section_id] = generateInitColumnsFromBlocks(
            blocksBySection[section.section_id] ?? [],
            isMobile ? MOBILE_COLUMN_NUMBER : section.saved_column_num
          );
        }

        setSectionColumns(initColumns);
        generatePositionedBlocks();
        setBoardInitialized(true);
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setBoardSections, setBoard, setSelectedSection]);
}
