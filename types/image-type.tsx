import { Tables, TablesInsert } from "./supabase";

export type ImageInsert = TablesInsert<"images">;
export type ImageDownload = Tables<"images">;

export type BlockInsert = TablesInsert<"blocks">;

export type UploadStatus = "pending" | "uploading" | "uploaded" | "error";
export type FileType = "database" | "blob" | "local";
export type BlockType = "image" | "text" | "spacer";

export type Block = {
  block_id: string;

  board_id: string;

  block_type: BlockType;
  image_id?: string;
  data: MudboardImage | TextBlock | SpacerBlock;

  col_index: number;
  row_index: number;
  deleted: boolean;
};

export type MudboardImage = {
  image_id: string;

  file_ext: string;
  original_name: string;

  width: number;
  height: number;

  description: string;
  order_index?: number;

  // defined by me on fetch
  fileName: string;

  // helper types
  fileType?: FileType;
  uploadStatus?: UploadStatus;
};

export type TextBlock = {
  text: string;
};

export type SpacerBlock = {
  height: number;
};

export type GalleryOrder = {
  id: string;
  section: number;
  order: number;
};
