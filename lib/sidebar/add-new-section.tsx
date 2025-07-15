import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "../auth/can-edit-board";
import { createSupabaseBoardSection } from "../db-actions/create-new-section";
import { initializeSectionColumns } from "../columns/new-section-columns";
import { toast } from "sonner";

export async function addNewSection({
  board_id,
  title,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index: number;
}) {
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("Not adding new section");
    return null;
  }

  const user = useMetadataStore.getState().user;

  // create one in the database
  const newBoardSection = await createSupabaseBoardSection({
    board_id,
    title,
    order_index,
    claimedBy: user?.id ?? null,
  });

  // update locally
  useMetadataStore
    .getState()
    .setBoardSections((prev) => [...prev, newBoardSection]);

  // create a new array of columns to use
  initializeSectionColumns(newBoardSection.section);

  toast.success("Successfully created new section");
  return newBoardSection;
}
