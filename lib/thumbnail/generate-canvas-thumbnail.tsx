import html2canvas from "html2canvas-pro";
import { uploadThumbnail } from "@/lib/db-actions/thumbnails/upload-thumbnails";
import {
  DEFAULT_FILE_MIME,
  THUMBNAIL_HEIGHT_MAP,
  thumbnailNames,
} from "@/types/upload-settings";

export async function generateThumbnailFromRef({
  element,
  boardId,
  thumbnailType,
}: {
  element: HTMLDivElement;
  boardId: string;
  thumbnailType: thumbnailNames;
}) {
  const thumbnailHeight = THUMBNAIL_HEIGHT_MAP[thumbnailType];

  const originalCanvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: null,
    scale: 1,
    logging: false,
  });

  const fullWidth = originalCanvas.width;

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = fullWidth;
  croppedCanvas.height = thumbnailHeight;

  const ctx = croppedCanvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(
    originalCanvas,
    0,
    0,
    fullWidth,
    thumbnailHeight,
    0,
    0,
    fullWidth,
    thumbnailHeight
  );

  const dataUrl = croppedCanvas.toDataURL(DEFAULT_FILE_MIME, 0.9);

  await uploadThumbnail(dataUrl, boardId, thumbnailType);

  return dataUrl;
}
