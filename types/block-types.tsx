// types for blocks
// NOTE: look at types/supabase.ts because that's where we keep the database accurate types

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

export type CropRect = { x: number; y: number; w: number; h: number };

export type Block = {
  block_id: string;
  section_id: string;

  block_type: BlockType;
  image_id?: string;
  data: MudboardImage | TextBlockType | null;

  height: number;
  width?: number;

  // this is the initial order
  col_index: number;
  row_index: number;
  order_index: number;

  caption: string | null;

  deleted: boolean;
  subsection_id?: string;

  is_flipped: boolean | null;
  is_greyscale: boolean | null;
  // crop: CropRect | null;
};

export type MudboardImage = {
  image_id: string;

  file_ext: string;
  original_name: string;

  og_width: number;
  og_height: number;
  blurhash?: string;

  // defined by me on fetch
  fileName: string;

  // helper types
  fileType?: FileType;
  uploadStatus?: UploadStatus;
};

export type VisualOverride = {
  is_flipped?: boolean;
  is_greyscale?: boolean;
  crop?: { x: number; y: number; w: number; h: number };
};

export type TextBlockType = {
  text: string;
};

export type SpacerBlock = {
  height: number;
};
