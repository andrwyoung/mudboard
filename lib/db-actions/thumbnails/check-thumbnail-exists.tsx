import { DEFAULT_FILE_EXT } from "@/types/upload-settings";
import { supabase } from "@/utils/supabase";

export const checkThumbnailExists = async (
  boardId: string,
  thumbType: "board-thumb-ext" | "board-thumb-dashboard"
): Promise<boolean> => {
  const path = `${thumbType}-${boardId}.${DEFAULT_FILE_EXT}`;

  const { data, error } = await supabase.storage
    .from("mudboard-thumbnails")
    .list("", {
      search: path,
    });

  if (error) {
    console.warn("Thumbnail existence check failed:", error);
    return false;
  }

  return data?.some((file) => file.name === path) ?? false;
};
