import { Tables, TablesInsert } from "./supabase";

export type ImageInsert = TablesInsert<"images">;
export type ImageDownload = Tables<"images">;

export type BlockInsert = TablesInsert<"blocks">;
export type BlockDownload = Tables<"blocks">;

export type UploadStatus =
  | "pending"
  | "uploading"
  | "uploaded"
  | "error"
  | "downloaded";
export type FileType = "database" | "blob" | "local";
export type BlockType = "image" | "text" | "spacer";

export type Block = {
  block_id: string;
  section_id: string;
  board_id: string;

  block_type: BlockType;
  image_id?: string;
  data: MudboardImage | TextBlockType | null;

  height: number;

  col_index: number;
  row_index: number;
  order_index: number;

  deleted: boolean;
};

export type MudboardImage = {
  image_id: string;

  file_ext: string;
  original_name: string;

  width: number;
  caption?: string | null;
  blurhash?: string;

  // defined by me on fetch
  fileName: string;

  // helper types
  fileType?: FileType;
  uploadStatus?: UploadStatus;
};

export type TextBlockType = {
  text: string;
};

export type SpacerBlock = {
  height: number;
};
