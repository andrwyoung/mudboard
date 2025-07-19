import {
  DEFAULT_FILE_EXT,
  SUPABASE_THUMBNAIL_URL,
  ThumbnailNames,
} from "@/types/upload-settings";

export function getThumbnailUrl(
  board_id: string,
  thumbType: ThumbnailNames
): string {
  return `${SUPABASE_THUMBNAIL_URL}/${thumbType}-${board_id}.${DEFAULT_FILE_EXT}`;
}
