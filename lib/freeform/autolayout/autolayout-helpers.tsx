import { BlockBounds } from "./run-autolayout";

export function getDistance(
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
}

export function isOverlappingWithSpacing(
  a: BlockBounds,
  b: BlockBounds,
  spacing: number
): boolean {
  return !(
    a.right + spacing <= b.x ||
    a.x >= b.right + spacing ||
    a.bottom + spacing <= b.y ||
    a.y >= b.bottom + spacing
  );
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
