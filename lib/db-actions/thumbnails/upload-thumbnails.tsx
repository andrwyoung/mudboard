import {
  DEFAULT_FILE_EXT,
  DEFAULT_FILE_MIME,
  thumbnailNames,
} from "@/types/upload-settings";
import { supabase } from "@/utils/supabase";

export const uploadThumbnail = async (
  dataUrl: string,
  boardId: string,
  name: thumbnailNames
) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const filePath = `${name}-${boardId}.${DEFAULT_FILE_EXT}`;

  const { error } = await supabase.storage
    .from("mudboard-thumbnails")
    .upload(filePath, blob, {
      upsert: true,
      contentType: DEFAULT_FILE_MIME,
    });

  if (error) {
    console.error("Thumbnail upload error:", error.message);
  } else {
    console.log("Thumbnail uploaded!");
  }
};
