// DATABASE only

// given a thumbnail, upload it.

import {
  DEFAULT_FILE_EXT,
  DEFAULT_FILE_MIME,
  ThumbnailNames,
} from "@/types/upload-settings";
import { supabase } from "@/lib/supabase/supabase-client";

export const uploadThumbnail = async (
  dataUrl: string,
  boardId: string,
  name: ThumbnailNames
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
