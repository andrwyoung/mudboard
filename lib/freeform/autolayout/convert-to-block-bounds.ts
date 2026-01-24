import { useFreeformStore } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { FREEFROM_DEFAULT_WIDTH } from "@/types/constants";
import { BlockBounds } from "./run-autolayout";

export function getBlockBounds(
  blocks: Block[],
  sectionId: string
): BlockBounds[] {
  const getBlockPosition = useFreeformStore.getState().getBlockPosition;

  return blocks.map((block) => {
    const blockPos = getBlockPosition(sectionId, block.block_id);

    const width = block.width ?? FREEFROM_DEFAULT_WIDTH;
    const height = block.height;
    const x = blockPos.x ?? 0;
    const y = blockPos.y ?? 0;
    const scale = blockPos.scale;

    return {
      block,
      blockId: block.block_id,
      x,
      y,
      width,
      height,
      scale,
      right: x + width * scale,
      bottom: y + height * scale,
      centerX: x + (width * scale) / 2,
      centerY: y + (height * scale) / 2,
      zIndex: blockPos.z,
    };
  });
}
