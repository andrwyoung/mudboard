import { isOverlappingWithSpacing, getDistance } from "./autolayout-helpers";
import {
  ALL_DIRECTIONS,
  BLOCK_SPACING,
  BlockBounds,
  DirectionType,
} from "./run-autolayout";

// HELPERS

const MAX_ITERATIONS = 1000; // for our own safety. so no infinite loops

function resolveBlockOverlapOneDirection(
  current: BlockBounds,
  allBlocks: BlockBounds[],
  direction: DirectionType
): { x: number; y: number } {
  const temp = { ...current };
  const otherBlocks = allBlocks.filter((b) => b.blockId !== current.blockId);

  // if a block is overlap, keep pushing it out
  // until it doesn't overlap with anything
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const overlapping = otherBlocks.find((other) =>
      isOverlappingWithSpacing(temp, other, BLOCK_SPACING)
    );
    if (!overlapping) break;

    let delta = 0;

    switch (direction) {
      case "up":
        delta = overlapping.y - (temp.bottom + BLOCK_SPACING);
        if (delta >= 0) return { x: temp.x, y: temp.y };
        temp.y += delta;
        temp.bottom += delta;
        temp.centerY += delta;
        break;

      case "down":
        delta = overlapping.bottom + BLOCK_SPACING - temp.y;
        if (delta <= 0) return { x: temp.x, y: temp.y };
        temp.y += delta;
        temp.bottom += delta;
        temp.centerY += delta;
        break;

      case "left":
        delta = overlapping.x - (temp.right + BLOCK_SPACING);
        if (delta >= 0) return { x: temp.x, y: temp.y };
        temp.x += delta;
        temp.right += delta;
        temp.centerX += delta;
        break;

      case "right":
        delta = overlapping.right + BLOCK_SPACING - temp.x;
        if (delta <= 0) return { x: temp.x, y: temp.y };
        temp.x += delta;
        temp.right += delta;
        temp.centerX += delta;
        break;
    }
  }

  return { x: temp.x, y: temp.y };
}

function pickShortestPush(
  current: BlockBounds,
  candidates: { dir: DirectionType; result: { x: number; y: number } }[]
): { x: number; y: number } {
  let shortest = candidates[0];
  let minDistance = getDistance(current, shortest.result);

  for (let i = 1; i < candidates.length; i++) {
    const distance = getDistance(current, candidates[i].result);
    if (distance < minDistance) {
      shortest = candidates[i];
      minDistance = distance;
    }
  }

  console.log(
    `[push] block ${current.blockId} → ${shortest.dir} (${minDistance} units)`
  );

  return shortest.result;
}

// MAIN FUNCTION

export function resolveBlockOverlap(
  current: BlockBounds,
  allBlocks: BlockBounds[]
) {
  // push the block out in each direction until it doesn't overlap with anything
  const candidates = ALL_DIRECTIONS.map((dir) => ({
    dir,
    result: resolveBlockOverlapOneDirection(current, allBlocks, dir),
  }));

  // take those results and pick the direction that's the shortest
  const best = pickShortestPush(current, candidates);
  return best;
}
