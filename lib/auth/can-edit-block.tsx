import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { Block } from "@/types/block-types";
import { canEditSection } from "./can-edit-section";

export function canEditBlock(block: Block): boolean {
  const positionedBlock = useLayoutStore
    .getState()
    .positionedBlockMap.get(block.block_id);
  if (!positionedBlock) return false;

  const { boardSections } = useMetadataStore.getState();
  const matchingSection = boardSections.find(
    (bs) => bs.section.section_id === positionedBlock.sectionId
  );

  if (!matchingSection) return false;

  return canEditSection(matchingSection.section);
}
