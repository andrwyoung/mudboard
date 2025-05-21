import { Section } from "@/types/board-types";
import { hasWriteAccess } from "./check-write-access";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { useLayoutStore } from "@/store/layout-store";
import { createSupabaseSection } from "./create-new-section";
import { reindexSections } from "./reindex-sections";

export async function softDeleteSection(section: Section) {
  // check if access
  const canWrite = await hasWriteAccess();
  if (!canWrite) {
    console.warn("No write access: not deleting section");
    return false;
  }

  const boardId = useMetadataStore.getState().board?.board_id;
  if (!boardId) return false;

  // else this is not the last section. just delete it
  // soft delete both blocks and section from db
  const { error } = await supabase
    .from("sections")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("section_id", section.section_id);

  const { error: blockErr } = await supabase
    .from("blocks")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("section_id", section.section_id);

  if (error || blockErr) {
    console.error("Failed to delete section:", error);
    toast.error("Failed to delete section");
    return false;
  }

  // if successfully then delete both section and blocks locally too
  useMetadataStore.setState((s) => ({
    sections: s.sections.filter((s) => s.section_id !== section.section_id),
  }));

  useLayoutStore.setState((s) => {
    const updated = { ...s.sectionColumns };
    delete updated[section.section_id];
    return { sectionColumns: updated };
  });

  // SPECIAL CASE: if it was selected
  const allSections = useMetadataStore.getState().sections;
  const isSelected =
    section.section_id ===
    useSelectionStore.getState().selectedSection?.section_id;

  if (isSelected && allSections.length > 0) {
    useSelectionStore.setState(() => ({
      selectedSection: allSections[0],
    }));
  }

  // SPECIAL CASE: if section is the only one left, then
  // immediately make a blank section
  if (allSections.length <= 0) {
    console.log("Last section, creating new one");
    const fallback = await createSupabaseSection({
      board_id: boardId,
      order_index: 0,
    });

    useMetadataStore.setState(() => ({
      sections: [fallback],
    }));

    useLayoutStore.setState(() => ({
      sectionColumns: {
        [fallback.section_id]: [],
      },
    }));

    useSelectionStore.getState().setSelectedSection(fallback);
  }

  // reorder sections
  await reindexSections();

  // toast
  toast.success(`Deleted section: ${section.title ?? DEFAULT_SECTION_NAME}`);
  return true;
}
