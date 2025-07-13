import { useFreeformStore } from "@/store/freeform-store";
import { useLayoutStore } from "@/store/layout-store";
import { mainCanvasRef } from "@/store/ui-store";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";
import { getFitToScreenCamera } from "./get-default-camera";

export function FitCameraToScreen(sectionId: string) {
  const el = mainCanvasRef.current;
  if (!el) return;

  const blocks = useLayoutStore.getState().positionedBlockMap;
  const posMap = useFreeformStore.getState().positionMap[sectionId];
  if (!posMap || Object.keys(posMap).length === 0) return;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const [blockId, pos] of Object.entries(posMap)) {
    const block = blocks.get(blockId)?.block;
    const scale = pos.scale ?? 1;
    const width = (block?.width ?? COMPRESSED_IMAGE_WIDTH) * scale;
    const height = (block?.height ?? 0) * scale;

    const x = pos.x ?? 0;
    const y = pos.y ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  const bounds = { minX, minY, maxX, maxY };
  useFreeformStore.getState().setLayoutBoundsForSection(sectionId, bounds);

  const rect = el.getBoundingClientRect();
  const camera = getFitToScreenCamera(bounds, rect.width, rect.height);
  useFreeformStore.getState().setCameraForSection(sectionId, camera);
}
