import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { Block } from "@/types/block-types";
import { canEditSection } from "./can-edit-section";

export function canEditBlock(block: Block): boolean {
  const positionedBlock = useLayoutStore
    .getState()
    .positionedBlockMap.get(block.block_id);
  if (!positionedBlock) return false; // if block don't exist. then no

  const { boardSectionMap } = useMetadataStore.getState();
  const matchingSection = boardSectionMap[positionedBlock.sectionId];
  if (!matchingSection) return false; // if section don't exit. then no

  return canEditSection(matchingSection.section);
}
