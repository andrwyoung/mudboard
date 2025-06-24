import { cloneSection } from "./clone-section";
import { cloneBlocksFromSections } from "./clone-blocks-in-section";
import { Section } from "@/types/board-types";
import { linkSectionToBoard } from "./link-section";

export async function forkSection({
  originalSection,
  destinationBoardId,
  orderInBoard,
  newOwnerUserId,
}: {
  originalSection: Section;
  destinationBoardId: string;
  orderInBoard: number;
  newOwnerUserId: string | null;
}): Promise<{ newSectionId: string } | null> {
  // Step 1: Clone the section
  const cloneResult = await cloneSection({
    originalSection,
    destinationBoardId,
    positionInBoard: orderInBoard,
    newOwnerUserId,
  });

  if (!cloneResult) return null;
  const newSectionId = cloneResult.newSectionId;

  // Step 2: Clone its blocks
  await cloneBlocksFromSections({
    [originalSection.section_id]: newSectionId,
  });

  // Step 3: Link cloned section to board (handles board_sections + hydration)
  await linkSectionToBoard({
    destinationBoardId,
    sectionToLink: newSectionId,
    orderInBoard,
  });

  return { newSectionId };
}
