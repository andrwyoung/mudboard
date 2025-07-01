import type { PositionedBlock } from "@/types/sync-types";

export function getNextImageFrom(
  masterBlockOrder: PositionedBlock[],
  currentId: string
): PositionedBlock | null {
  const currentIndex = masterBlockOrder.findIndex(
    (b) => b.block.block_id === currentId
  );

  return (
    masterBlockOrder
      .slice(currentIndex + 1)
      .find((b) => b.block.block_type === "image") ?? null
  );
}

export function getPrevImageFrom(
  masterBlockOrder: PositionedBlock[],
  currentId: string
): PositionedBlock | null {
  const currentIndex = masterBlockOrder.findIndex(
    (b) => b.block.block_id === currentId
  );

  return (
    [...masterBlockOrder.slice(0, currentIndex)]
      .reverse()
      .find((b) => b.block.block_type === "image") ?? null
  );
}
