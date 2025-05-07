export const DEFAULT_BOARD_ID = "b92fe04b-01cd-4806-a1d3-9e108b9902e3"

export const SUPABASE_OBJECT_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mudboard-photos`;

// virtualization
export const OVERSCAN_SIZE = 1000;
export const IMAGE_OVERSCAN_SIZE = 600;


// compression
export const MAX_IMAGE_WIDTH = 1600;
export const COMPRESSED_IMAGE_WIDTH = 600;
export const COMPRESSED_THUMB_WIDTH = 300;
export const DEFAULT_FILE_EXT = "webp";

export type imageNames = "thumb" | "medium" | "full";

export const IMAGE_VARIANT_MAP: Record<imageNames, { width: number; quality: number }> = {
  thumb: { width: COMPRESSED_THUMB_WIDTH, quality: 0.5 },
  medium: { width: COMPRESSED_IMAGE_WIDTH, quality: 0.6 },
  full: { width: MAX_IMAGE_WIDTH, quality: 0.8 },
};

export const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/tiff",
  ];



  // concurrent uploads
  export const UPLOAD_THREADS = 3;
  export const COMPRESSION_THREADS = 3;