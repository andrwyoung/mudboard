// mark a section for deletion both in the database and locally

import { BoardSection } from "@/types/board-types";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { useLayoutStore } from "@/store/layout-store";
import { reindexSections } from "./reindex-sections";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { createSupabaseSection } from "./create-new-section";
import { SoftDeleteSections } from "./soft-delete-section";

export async function softDeleteBoardSection(
  boardSection: BoardSection,
  userId: string | undefined
) {
  // check if access
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not deleting section");
    return false;
  }

  const boardId = useMetadataStore.getState().board?.board_id;
  if (!boardId) return false;

  // else this is not the last section. just delete it
  // soft delete both blocks and section from db
  const { error } = await supabase
    .from("board_sections")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("board_section_id", boardSection.board_section_id);

  // const { error: blockErr } = await supabase
  //   .from("blocks")
  //   .update({ deleted: true, deleted_at: new Date().toISOString() })
  //   .eq("section_id", section.section_id);

  if (error) {
    console.error("Failed to delete section:", error);
    toast.error("Failed to delete section");
    return false;
  }

  // Soft-delete the actual section if it's orphaned
  const deletedSectionIds = await SoftDeleteSections(
    [boardSection.section.section_id],
    userId
  );

  // if successfully then delete both section and blocks locally too
  useMetadataStore.setState((s) => ({
    boardSections: s.boardSections.filter(
      (bs) => bs.board_section_id !== boardSection.board_section_id
    ),
  }));

  useLayoutStore.setState((s) => {
    const updated = { ...s.sectionColumns };
    delete updated[boardSection.section.section_id];
    return { sectionColumns: updated };
  });

  // SPECIAL CASE: if it was selected
  const allBoardSections = useMetadataStore.getState().boardSections;
  const isSelected =
    boardSection.section.section_id ===
    useSelectionStore.getState().selectedSection?.section.section_id;

  if (isSelected && allBoardSections.length > 0) {
    useSelectionStore.setState(() => ({
      selectedSection: allBoardSections[0],
    }));
  }

  // SPECIAL CASE: if section is the only one left, then
  // immediately make a blank section
  const user = useMetadataStore.getState().user;
  if (allBoardSections.length <= 0) {
    console.log("Last section, creating new one");
    const fallback = await createSupabaseSection({
      board_id: boardId,
      order_index: 0,
      claimedBy: user?.id ?? null,
    });

    useMetadataStore.setState(() => ({
      boardSections: [fallback],
    }));

    useLayoutStore.setState(() => ({
      sectionColumns: {
        [fallback.section.section_id]: [],
      },
    }));

    useSelectionStore.getState().setSelectedSection(fallback);
  }

  // reorder sections
  await reindexSections();

  // toast
  const sectionName = boardSection.section.title ?? DEFAULT_SECTION_NAME;
  if (deletedSectionIds?.includes(boardSection.section.section_id)) {
    toast.success(`Deleted section: ${sectionName}`);
  } else {
    toast.success(`Unlinked section: ${sectionName}`);
  }

  return true;
}
