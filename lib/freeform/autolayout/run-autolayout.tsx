import { useFreeformStore } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { resolveBlockOverlap } from "./push-phase";
import { pullTowardsCenter } from "./pull-phase";
import { getWeightedCenter } from "./autolayout-helpers";

export const BLOCK_SPACING = 40;
export const SNAP_TOLERANCE = 0.1;

export type BlockBounds = {
  block: Block;
  blockId: string;

  x: number; // left edge of block
  y: number; // top edge of block
  width: number;
  height: number;
  scale: number;

  right: number; // right edge of block
  bottom: number; // bottom edge of block
  centerX: number;
  centerY: number;

  zIndex: number;
};

export const ALL_DIRECTIONS = ["up", "down", "left", "right"];
export type DirectionType = (typeof ALL_DIRECTIONS)[number];

export function runFreeformAutoLayout(
  blockBounds: BlockBounds[],
  sectionId: string
) {
  // PUSH PHASE

  // STEP 1: organize block by distance from center
  //
  const originalBlockBounds = blockBounds;

  // compute center
  const { centerX: pushCenterX, centerY: pushCenterY } =
    getWeightedCenter(originalBlockBounds);

  // sort by distance to center
  originalBlockBounds.sort((a, b) => {
    const da =
      Math.abs(a.centerX - pushCenterX) + Math.abs(a.centerY - pushCenterY);
    const db =
      Math.abs(b.centerX - pushCenterX) + Math.abs(b.centerY - pushCenterY);
    return da - db; // closest first
  });

  // STEP 2: resolve overlaps
  //
  const updatedBlockBounds: BlockBounds[] = [];

  for (const block of originalBlockBounds) {
    const resolved = resolveBlockOverlap(block, updatedBlockBounds);
    updatedBlockBounds.push({
      ...block,
      x: resolved.x,
      y: resolved.y,
      right: resolved.x + block.width * block.scale,
      bottom: resolved.y + block.height * block.scale,
      centerX: resolved.x + (block.width * block.scale) / 2,
      centerY: resolved.y + (block.height * block.scale) / 2,
    });
  }

  // PULL PHASE
  //
  // STEP 1: recompute center
  const { centerX: pullCenterX, centerY: pullCenterY } =
    getWeightedCenter(updatedBlockBounds);

  // STEP 2: pull blocks toward the center
  for (const block of updatedBlockBounds) {
    const pulledBlock = pullTowardsCenter({
      pullCenterX,
      pullCenterY,
      block,
      updatedBlockBounds,
    });

    // if there is an update then assign it
    if (pulledBlock) {
      Object.assign(block, pulledBlock);
    }
  }

  // END

  // step 1: convert to blocks
  const updates = updatedBlockBounds.map(({ block, x, y }) => ({
    blockId: block.block_id,
    pos: { x, y },
  }));

  // step 2: update to store!
  useFreeformStore.getState().updateMultipleBlockPositions(sectionId, updates);
}
