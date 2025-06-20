import { TablesInsert } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import { fetchSupabaseBlocks } from "../fetch-db-blocks";
import { BoardSection } from "@/types/board-types";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useMetadataStore } from "@/store/metadata-store";
import { useLayoutStore } from "@/store/layout-store";

export async function linkSectionToBoard({
  destinationBoardId,
  sectionToLink,
  orderInBoard,
}: {
  destinationBoardId: string;
  sectionToLink: string;
  orderInBoard: number;
}): Promise<BoardSection | null> {
  // STEP 1: create new board_section relation
  const { data: boardSectionMetadata, error: bsError } = await supabase
    .from("board_sections")
    .insert([
      {
        board_id: destinationBoardId,
        section_id: sectionToLink,
        order_index: orderInBoard,
      } as TablesInsert<"board_sections">,
    ])
    .select()
    .single();

  if (bsError || !boardSectionMetadata) {
    console.error("Error creating board_section:", bsError);
    throw new Error("Failed to create board_section");
  }

  //
  // STEP 2: now grab that board section along with the section
  const { data: boardSectionData, error } = await supabase
    .from("board_sections_with_stats")
    .select("*, section:sections(*)")
    .eq("board_section_id", boardSectionMetadata.board_section_id)
    .single();

  if (error) {
    throw new Error("Failed to fetch board_sections: " + error.message);
  }

  const boardSection = boardSectionData as BoardSection;
  const section = boardSection.section;
  section.visualColumnNum = section.saved_column_num;

  // STEP 2b: insert board section locally locally
  const currentSections = useMetadataStore.getState().boardSections;
  useMetadataStore
    .getState()
    .setBoardSections([...currentSections, boardSection]);

  // STEP 3: now fetch the blocks (i hope it regenerates)
  const blocks = await fetchSupabaseBlocks([section.section_id]);
  const blockSectionColumn = generateInitColumnsFromBlocks(
    blocks[section.section_id],
    section.saved_column_num
  );

  // STEP 3b: insert those locally
  const currentColumns = useLayoutStore.getState().sectionColumns;
  useLayoutStore.getState().setSectionColumns({
    ...currentColumns,
    [section.section_id]: blockSectionColumn,
  });

  // return the boardSection id
  return boardSection;
}
