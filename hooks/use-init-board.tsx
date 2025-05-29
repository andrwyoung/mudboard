// /hooks/use-blocks-by-section.ts
import { createSupabaseSection } from "@/lib/db-actions/create-new-section";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { useLoadingStore } from "@/store/loading-store";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import { Section } from "@/types/board-types";
import { useEffect } from "react";
import { toast } from "sonner";

export function useInitBoard(
  boardId: string,
  setFlatBlocks: (e: Block[]) => void,
  setInitSections: (s: Section[]) => void,
  setIsExpired: (s: boolean) => void
) {
  const setSections = useMetadataStore((s) => s.setSections);
  const setBoard = useMetadataStore((s) => s.setBoard);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);

  const setNumCols = useUIStore((s) => s.setNumCols);

  useEffect(() => {
    async function loadImages() {
      try {
        const board = await fetchSupabaseBoard(boardId);
        setBoard(board);
        if (board.saved_column_num) {
          setNumCols(board.saved_column_num);
          useLoadingStore.setState(() => ({
            // this is a UI thing
            sliderVal: board.saved_column_num,
          }));
        }

        if (board.deleted_at && new Date(board.deleted_at) <= new Date()) {
          toast.error("This board has expired.");
          setIsExpired(true);
        }

        const blocks = await fetchSupabaseBlocks(boardId);
        setFlatBlocks(blocks);

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
        setInitSections(sections);
        const topSection = sections.reduce((min, curr) =>
          (curr.order_index ?? 0) < (min.order_index ?? 0) ? curr : min
        );
        if (topSection) {
          setSelectedSection(topSection);
        }
        console.log("Set sections to:", sections);
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setSections, setBoard, setSelectedSection]);
}
