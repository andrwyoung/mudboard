import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";

export function getColumnHeights(sectionId: string): number[] {
  const columns = useLayoutStore.getState().sectionColumns[sectionId] ?? [];
  const spacing = useUIStore.getState().spacingSize;

  return columns.map((col) => {
    return col.reduce((sum, block, index) => {
      const height = block.height ?? 0;
      const padding = index > 0 ? spacing : 0;
      return sum + height + padding;
    }, 0);
  });
}

export function findShortestColumn(sectionId: string): number {
  const heights = getColumnHeights(sectionId);
  return heights.indexOf(Math.min(...heights));
}

export function getNextRowIndex(col: Block[]): number {
  if (col.length === 0) return 0;
  const spacing = useUIStore.getState().spacingSize;

  const lastBlock = col[col.length - 1];
  const height = lastBlock.height ?? 0;
  const rowIndex = lastBlock.row_index ?? 0;

  return rowIndex + height + spacing;
}
