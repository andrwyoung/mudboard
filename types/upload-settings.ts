export const SUPABASE_OBJECT_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mudboard-photos`;

export const MAX_IMAGE_WIDTH = 1600;
export const COMPRESSED_IMAGE_WIDTH = 600;
export const COMPRESSED_THUMB_WIDTH = 300;
export const DEFAULT_FILE_EXT = "webp";

export const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/tiff",
  ];