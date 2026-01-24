import {
  ImageSizes,
  R2_OBJECT_URL,
  SUPABASE_OBJECT_URL,
} from "@/types/upload-settings";

export function getImageUrl(
  image_id: string,
  file_ext: string,
  size: ImageSizes
): string {
  return `${R2_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
  // return `${SUPABASE_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
}
