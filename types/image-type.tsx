import { Tables, TablesInsert } from "./supabase";

export type ImageInsert = TablesInsert<"images">;
export type ImageDownload = Tables<"images">;

export type ImageType = {
  image_id: string;

  file_ext: string;
  original_name: string;

  width: number;
  height: number;

  description: string;
  order_index?: number;

  // defined by me on fetch
  fileName: string;
};

export type GalleryOrder = {
  id: string;
  section: number;
  order: number;
};
