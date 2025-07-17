import { useFreeformStore } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { FREEFROM_DEFAULT_WIDTH } from "@/types/constants";
import { resolveBlockOverlap } from "./push-phase";
import { pullTowardsCenter } from "./pull-phase";

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

export function getDistance(
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
}

export function isOverlappingWithSpacing(
  a: BlockBounds,
  b: BlockBounds
): boolean {
  return !(
    a.right + BLOCK_SPACING <= b.x ||
    a.x >= b.right + BLOCK_SPACING ||
    a.bottom + BLOCK_SPACING <= b.y ||
    a.y >= b.bottom + BLOCK_SPACING
  );
}

export function isTooClose(a: BlockBounds, b: BlockBounds): boolean {
  return !(
    a.right + BLOCK_SPACING - SNAP_TOLERANCE <= b.x ||
    a.x >= b.right + BLOCK_SPACING - SNAP_TOLERANCE ||
    a.bottom + BLOCK_SPACING - SNAP_TOLERANCE <= b.y ||
    a.y >= b.bottom + BLOCK_SPACING - SNAP_TOLERANCE
  );
}

// helper for step 1
function getBlockBounds(blocks: Block[], sectionId: string): BlockBounds[] {
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

export function getWeightedCenter(blocks: BlockBounds[]): {
  centerX: number;
  centerY: number;
} {
  let totalWeight = 0;
  let sumX = 0;
  let sumY = 0;

  for (const b of blocks) {
    const area = b.width * b.height * b.scale * b.scale;
    totalWeight += area;
    sumX += b.centerX * area;
    sumY += b.centerY * area;
  }

  return {
    centerX: totalWeight > 0 ? sumX / totalWeight : 0,
    centerY: totalWeight > 0 ? sumY / totalWeight : 0,
  };
}

export function runFreeformAutoLayout(blocks: Block[], sectionId: string) {
  // PUSH PHASE

  // STEP 1: organize block by distance from center
  //
  const originalBlockBounds = getBlockBounds(blocks, sectionId);

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
