export const DEFAULT_BOARD_ID = "06b0c345-35bd-4852-9e80-b4e8e698a1e0"

export const SUPABASE_OBJECT_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mudboard-photos`;

// virtualization
export const OVERSCAN_SIZE = 1000;
export const IMAGE_OVERSCAN_SIZE = 600;
// fixed heights
export const TEXT_BLOCK_HEIGHT = 120;
export const CAPTION_HEIGHT = 28;

// syncing
export const AUTOSYNC_DELAY = 5000;


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


export const allowedUploadExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "tiff",
  "avif",
  "svg",
  "bmp",
  "ico",
  "jfif",
  "apng",
  // "pdf",
];
export const allowedMimeTypes = allowedUploadExtensions.map((ext) => {
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "jfif":
      return "image/jpeg";
    case "tiff":
      return "image/tiff";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "pdf":
      return "application/pdf";
    default:
      return `image/${ext}`;
  }
});

 //white listed domains
 export const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://mudboard.com",
  "https://andrwyoung.com",
];
  // password
  export const SALT_ROUNDS = 10;


  //uploading
  export const DROP_SPREAD_THRESHOLD = 3;
  // concurrent uploads
  export const UPLOAD_THREADS = 3;
  export const COMPRESSION_THREADS = 3;
