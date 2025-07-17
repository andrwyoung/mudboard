import { Block } from "@/types/block-types";
import { BlockBounds, runFreeformAutoLayout } from "./run-autolayout";
import { getBlockBounds } from "./convert-to-block-bounds";
import { isOverlappingWithSpacing } from "./autolayout-helpers";

const CLUSTER_DISTANCE = 400; // tweak this based on visual separation

// HELPERS
function detectClusters(blockBounds: BlockBounds[]): BlockBounds[][] {
  const visited = new Set<string>();
  const clusters: BlockBounds[][] = [];

  for (const block of blockBounds) {
    if (visited.has(block.blockId)) continue;

    const cluster: BlockBounds[] = [];
    const stack = [block];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current.blockId)) continue;

      visited.add(current.blockId);
      cluster.push(current);

      for (const other of blockBounds) {
        if (visited.has(other.blockId)) continue;

        if (isOverlappingWithSpacing(current, other, CLUSTER_DISTANCE)) {
          stack.push(other);
        }
      }
    }

    if (cluster.length > 0) clusters.push(cluster);
  }

  return clusters;
}

// MAIN FUNCTION

export function runAutoLayoutWithClustering(
  blocks: Block[],
  sectionId: string
) {
  const blockBounds = getBlockBounds(blocks, sectionId);

  const clusters = detectClusters(blockBounds);
  for (const cluster of clusters) {
    console.log("Running autolayout for cluster: ", cluster);
    runFreeformAutoLayout(cluster, sectionId);
  }
}
