import { SectionStats } from "@/types/stat-types";
import { supabase } from "@/utils/supabase";

export async function SoftDeleteSections(sectionIds: string[]) {
  // STEP 1: first check if there are no more sections existing
  const { data: sectionStats, error: sectionStatsError } = await supabase
    .from("section_stats")
    .select("*")
    .eq("deleted", false) // don't get the deleted ones
    .in("section_id", sectionIds);

  // TODO: check later on that sections are deleted too

  if (sectionStatsError) {
    console.error("Error fetching section stats:", sectionStatsError.message);
    return;
  }

  const stats = sectionStats as SectionStats[];

  const sectionIdsToDelete = stats
    .filter((stat) => stat.shallow_copy_count === 0 && !stat.is_shared)
    .map((stat) => stat.section_id);

  if (sectionIdsToDelete.length === 0) {
    console.log("No sections eligible for soft deletion.");
    return;
  }

  // STEP 2: if not, then soft delete the sections
  const { error: deleteSectionsError } = await supabase
    .from("sections")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .in("section_id", sectionIdsToDelete);

  if (deleteSectionsError) {
    console.error("Failed to delete sections:", deleteSectionsError.message);
    return;
  }

  // STEP 3: clean up all the blocks too:
  const { error: blockErr } = await supabase
    .from("blocks")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .in("section_id", sectionIdsToDelete);

  if (blockErr) {
    console.error("Failed to delete blocks:", blockErr.message);
    return;
  }

  console.log(`Soft deleted ${sectionIdsToDelete.length} section(s)`);
}
