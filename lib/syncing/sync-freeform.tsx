import { FreeformPosition } from "@/store/freeform-store";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "../auth/can-edit-board";
import { canEditSection } from "../auth/can-edit-section";
import { runSupabaseBatchUpdates } from "../db-actions/run-batch-updates";

export async function syncFreeformToSupabase(
  sectionId: string,
  blockPositions: Record<string, FreeformPosition>
): Promise<boolean> {
  const section = useMetadataStore
    .getState()
    .boardSections.find((bs) => bs.section.section_id === sectionId)?.section;

  if (!section) {
    console.error("Missing Section when syncing Freeform!!");
    return false;
  }

  const canWrite = canEditBoard() && canEditSection(section);
  if (!canWrite) {
    console.warn("No write access: not syncing Freeform layout");
    return false;
  }

  const updates = Object.entries(blockPositions)
    .filter(([id]) => !id.startsWith("temp-"))
    .map(([block_id, pos]) => ({
      block_id,
      section_id: sectionId,
      canvas_x: pos.x,
      canvas_y: pos.y,
      canvas_z: pos.z,
      canvas_scale: pos.scale,
    }));

  if (updates.length === 0) return true;

  return await runSupabaseBatchUpdates(updates, "Freeform");
}
