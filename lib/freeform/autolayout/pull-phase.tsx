import {
  BLOCK_SPACING,
  BlockBounds,
  DirectionType,
  getDistance,
  isTooClose,
  SNAP_TOLERANCE,
} from "./run-autolayout";

const PULL_STEP_SIZE = 10;

type PullResult =
  | { type: "moved"; block: BlockBounds }
  | { type: "already-spaced" }
  | null;

export function simulatePull(
  block: BlockBounds,
  allBlocks: BlockBounds[],
  direction: DirectionType,
  maxSteps: number // how many steps to take
): PullResult {
  const otherBlocks = allBlocks.filter((b) => b.blockId !== block.blockId);
  const clone = { ...block };

  const step = PULL_STEP_SIZE;

  for (let i = 0; i < maxSteps; i++) {
    // walk block in the given direction
    switch (direction) {
      case "left":
        clone.x -= step;
        break;
      case "right":
        clone.x += step;
        break;
      case "up":
        clone.y -= step;
        break;
      case "down":
        clone.y += step;
        break;
    }

    // Update derived bounds
    clone.right = clone.x + clone.width * clone.scale;
    clone.bottom = clone.y + clone.height * clone.scale;
    clone.centerX = clone.x + (clone.width * clone.scale) / 2;
    clone.centerY = clone.y + (clone.height * clone.scale) / 2;

    const collided = otherBlocks.find((b) => isTooClose(clone, b));

    if (collided) {
      let targetX = clone.x;
      let targetY = clone.y;

      //   switch (direction) {
      //     case "left":
      //       targetX += step;
      //       break;
      //     case "right":
      //       targetX -= step;
      //       break;
      //     case "up":
      //       targetY += step;
      //       break;
      //     case "down":
      //       targetY -= step;
      //       break;
      //   }

      switch (direction) {
        case "left":
          targetX = collided.right + BLOCK_SPACING;
          break;
        case "right":
          targetX = collided.x - clone.width * clone.scale - BLOCK_SPACING;
          break;
        case "up":
          targetY = collided.bottom + BLOCK_SPACING;
          break;
        case "down":
          targetY = collided.y - clone.height * clone.scale - BLOCK_SPACING;
          break;
      }

      const delta =
        direction === "left" || direction === "right"
          ? Math.abs(block.x - targetX)
          : Math.abs(block.y - targetY);

      if (delta < SNAP_TOLERANCE) {
        return { type: "already-spaced" };
      }

      // Snap to target spacing
      clone.x = targetX;
      clone.y = targetY;
      clone.right = clone.x + clone.width * clone.scale;
      clone.bottom = clone.y + clone.height * clone.scale;
      clone.centerX = clone.x + (clone.width * clone.scale) / 2;
      clone.centerY = clone.y + (clone.height * clone.scale) / 2;

      return { type: "moved", block: clone };
    }
  }

  return null; // never found a collision — maybe too far out
}

export function pullTowardsCenter({
  pullCenterX,
  pullCenterY,
  block,
  updatedBlockBounds,
}: {
  pullCenterX: number;
  pullCenterY: number;
  block: BlockBounds;
  updatedBlockBounds: BlockBounds[];
}) {
  const dx = pullCenterX - block.centerX;
  const dy = pullCenterY - block.centerY;

  // Determine two directions that point toward center
  let direction1: DirectionType;
  let direction2: DirectionType | null = null;

  if (dx === 0 && dy === 0) {
    return null; // Already centered
  } else if (dx === 0) {
    console.log("Already centered X axis. Block: ", block.blockId);
    direction1 = dy > 0 ? "down" : "up";
    direction2 = null;
  } else if (dy === 0) {
    console.log("Already centered Y axis. Block: ", block.blockId);
    direction1 = dx > 0 ? "right" : "left";
    direction2 = null;
  } else if (Math.abs(dx) > Math.abs(dy)) {
    direction1 = dx > 0 ? "right" : "left";
    direction2 = dy > 0 ? "down" : "up";
  } else {
    direction1 = dy > 0 ? "down" : "up";
    direction2 = dx > 0 ? "right" : "left";
  }

  // then figure out which direction to move in first
  const MAX_PULL_LOOPS = 10;
  let attempts = 0;

  let finalBlock: BlockBounds | null = null;

  while (attempts++ < MAX_PULL_LOOPS) {
    let didMove = false;

    const getSteps = (dir: DirectionType | null): number => {
      if (!dir) return 0;
      const stepsToCenter = Math.ceil(
        Math.abs(dir === "left" || dir === "right" ? dx : dy) / PULL_STEP_SIZE
      );

      return stepsToCenter + 100;
    };

    const result1 = simulatePull(
      block,
      updatedBlockBounds,
      direction1,
      getSteps(direction1)
    );

    const result2 = direction2
      ? simulatePull(
          block,
          updatedBlockBounds,
          direction2,
          getSteps(direction2)
        )
      : null;

    const r1 = result1?.type;
    const r2 = result2?.type;

    if (
      (r1 === "already-spaced" || result1 === null) &&
      (r2 === "already-spaced" || result2 === null)
    ) {
      console.log(
        "Block done positioned. block: ",
        block.blockId,
        "pos 1: ",
        r1,
        "pos 2:",
        r2
      );
      break; // done!
    }

    // Choose the better of the two
    let best: BlockBounds | null = null;
    let bestDistance = Infinity;

    if (result1?.type === "moved") {
      const dist = getDistance(block, result1.block);
      if (dist < bestDistance) {
        best = result1.block;
        bestDistance = dist;
      }
    }

    if (result2?.type === "moved") {
      const dist = getDistance(block, result2.block);
      if (dist < bestDistance) {
        best = result2.block;
        bestDistance = dist;
      }
    }

    if (best) {
      Object.assign(block, best); // apply the pull
      finalBlock = best;
      didMove = true;
    }

    if (!didMove) break;

    console.log({
      blockId: block.blockId,
      attempts,
      direction1,
      direction2,
      result1: result1?.type ?? null,
      result2: result2?.type ?? null,
    });
  }

  return finalBlock;
}
