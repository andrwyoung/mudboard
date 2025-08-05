import { handleLibrarySync } from "@/components/modals/share/handle-add-library";
import { supabase } from "@/lib/supabase/supabase-client";
import { useDemoStore } from "@/store/demo-store";
import { useMetadataStore } from "@/store/metadata-store";
import { Section } from "@/types/board-types";
import { toast } from "sonner";

export async function toggleFavorited(newResult: boolean, section: Section) {
  const update = { is_public: newResult };

  if (section.owned_by) {
    const { error } = await supabase
      .from("sections")
      .update(update)
      .eq("section_id", section.section_id);
    if (error) {
      toast.error(`Failed to update Section`);
      return;
    }
  }

  useMetadataStore.getState().updateBoardSection(section.section_id, update);

  const sectionTitle = section.title
    ? `"${section.title}"`
    : "Untitled Section";
  if (newResult) {
    toast.success(`Starred in Library: ${sectionTitle}`);
  } else {
    toast.success(`Unstarred in Library: ${sectionTitle}`);
  }

  const isDemo = useDemoStore.getState().isDemoBoard;
  const user = useMetadataStore.getState().user;

  await handleLibrarySync(section, newResult, isDemo || !user);
}
