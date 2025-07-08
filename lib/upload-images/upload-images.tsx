// the monster file that deals with all the uploading of images

// we multithread compress and blurhash FIRST. this is so that we immediately let people interact
// with the images
// only after that do we slowly upload the files in the background

import {
  allowedMimeTypes,
  COMPRESSION_THREADS,
  DEFAULT_FILE_EXT,
  DROP_SPREAD_THRESHOLD,
  imageNames,
  mimeToExtension,
  UPLOAD_THREADS,
} from "@/types/upload-settings";
import { toast } from "sonner";
import { runWithConcurrency } from "../../utils/concurrency-helper";
import { uploadImageToSupabase } from "../db-actions/upload-single-image";
import { v4 as uuidv4 } from "uuid";
import { CompressedImage, convertToWebP } from "./processing/compress-image";
import {
  Block,
  BlockInsert,
  BlockType,
  MudboardImage,
} from "@/types/block-types";
import { generateBlurhashFromImage } from "./processing/blur-hash";
import { findShortestColumn } from "../columns/column-helpers";
import { useLayoutStore } from "@/store/layout-store";
import { useLoadingStore } from "@/store/loading-store";
import { rasterizeVectorImage } from "./processing/rasterize-vectors";
import { useMetadataStore } from "@/store/metadata-store";

type PreparedImage = {
  image_id: string;
  original_name: string;
  fileExt: string;

  variants: Record<imageNames, CompressedImage>;
  blurhash?: string;

  objectUrl: string;
  newImage: MudboardImage;
  bestEffortBlock: BlockInsert;
  tempBlockId: string;
};

export async function uploadImages(
  files: File[],
  sectionId: string,
  columnIndexPreference?: number,
  rowIndexPreference?: number
) {
  if (!files || files.length === 0) return;

  const user = useMetadataStore.getState().user;

  const updateColumnsInASection =
    useLayoutStore.getState().updateColumnsInASection;
  const updateColumns = (fn: (prevCols: Block[][]) => Block[][]) => {
    updateColumnsInASection(sectionId, fn);
  };

  let successfulUploads = 0;
  let totalUploads = files.length;
  //   let failedUploads = 0;

  console.time("🗜️ Compression phase");
  const toastId = toast.loading("Uploading images...", {
    duration: Infinity,
  });

  useLoadingStore.setState({ isUploading: true });

  const compressionTasks = Array.from(files).map((file) => async () => {
    const image_id = uuidv4();

    const match = file.name.match(/^(.*)\.([^.]+)$/);
    const original_name = match ? match[1] : file.name;
    let fileExt = match ? match[2].toLowerCase() : null; // just used to check

    if (!allowedMimeTypes.includes(file.type)) {
      toast.error(`Unrecognized file type`);
      totalUploads--;
      return;
    }

    if (!fileExt) {
      fileExt = mimeToExtension[file.type] ?? null;

      if (!fileExt) {
        toast.error(`Unsupported or unknown file type: ${file.type}`);
        totalUploads--;
        return;
      }
    }

    let processedFile = file;

    // SECTION: special case conversions
    //
    // pdf -> png
    // if (file.type === "application/pdf") {
    //   if (typeof window !== "undefined") {
    //     try {
    //       const { convertPdfPageOneToPng } = await import(
    //         "./processing/convert-pdf"
    //       );
    //       processedFile = await convertPdfPageOneToPng(file); // returns a WebP File
    //     } catch (err) {
    //       toast.error("Failed to convert PDF to image.");
    //       totalUploads--;
    //       return;
    //     }
    //   } else {
    //     console.warn("PDF processing skipped — not running in browser");
    //   }
    // } else
    if (
      // svg or ico -> raster
      file.type === "image/svg+xml" ||
      file.type === "image/x-icon"
    ) {
      try {
        processedFile = await rasterizeVectorImage(file); // returns a WebP File
      } catch {
        toast.error("Failed to convert vector image: ");
        totalUploads--;
        return;
      }
    }

    // SECTION: image compression
    //

    let variants: Record<imageNames, CompressedImage>;
    try {
      variants = await convertToWebP(processedFile);
    } catch (err) {
      toast.error("Image conversion failed. Please try a different file.");
      console.log("Image Conversion failed: ", err);
      return;
    }

    let blurhash: string | undefined;
    try {
      const thumbImg = new Image();
      thumbImg.src = URL.createObjectURL(variants.thumb.file);
      await new Promise((resolve, reject) => {
        thumbImg.onload = resolve;
        thumbImg.onerror = reject;
      });
      blurhash = await generateBlurhashFromImage(thumbImg);
    } catch (err) {
      console.warn("Failed to generate blurhash", err);
    }

    // SECTION: Putting it all together
    //

    const objectUrl = URL.createObjectURL(variants.full.file);
    const { width, height } = variants.full;

    const newImage: MudboardImage = {
      image_id,
      file_ext: DEFAULT_FILE_EXT,
      original_name,
      og_width: width,
      og_height: height,
      blurhash,

      fileName: objectUrl, // the local file
      fileType: "blob",
      uploadStatus: "uploading",

      uploaded_by: user?.id,
    };

    console.log("sectionId: ", sectionId);

    const tempBlockId = `temp-${uuidv4()}`;
    const incompleteBlock = {
      section_id: sectionId,
      block_type: "image" as BlockType,
      height,
      width,

      deleted: false,
    };

    // here we add it to local layout so we can immediately interact
    updateColumns((prevCols) => {
      const colIndex =
        files.length <= DROP_SPREAD_THRESHOLD &&
        columnIndexPreference !== undefined
          ? columnIndexPreference
          : findShortestColumn(sectionId);
      const rowIndex = rowIndexPreference ?? prevCols[colIndex].length;
      console.log("rowIndex: ", rowIndex);

      const newBlock: Block = {
        block_id: tempBlockId,

        ...incompleteBlock,
        data: newImage,

        saved_col_index: colIndex,
        saved_row_index: rowIndex,
        saved_order_index: 0,
        caption: null,

        is_flipped: null,
        is_greyscale: null,
        crop: null,

        canvas_x: null,
        canvas_y: null,
        canvas_scale: null,
        canvas_z: null,
      };

      const newCols = [...prevCols];
      const updatedCol = [...newCols[colIndex]];

      updatedCol.splice(rowIndex, 0, newBlock); // useful only if rowIndexPreference is true
      newCols[colIndex] = updatedCol;

      return newCols;
    });

    // best effort block
    // optimistically generate order and columns
    const cols = useLayoutStore.getState().sectionColumns[sectionId] ?? [];
    const optimisticColIndex =
      files.length <= DROP_SPREAD_THRESHOLD &&
      columnIndexPreference !== undefined
        ? columnIndexPreference
        : findShortestColumn(sectionId);
    const optimisticRowIndex =
      rowIndexPreference ?? cols[optimisticColIndex].length;
    const bestEffortBlock: BlockInsert = {
      ...incompleteBlock,

      col_index: optimisticColIndex,
      row_index: optimisticRowIndex,
      order_index: 0,
    };

    return {
      image_id,
      original_name,
      fileExt,
      variants,
      blurhash,
      objectUrl,
      newImage,
      bestEffortBlock,
      tempBlockId,
    };
  });

  const preparedImages = await runWithConcurrency<PreparedImage | undefined>(
    compressionTasks,
    COMPRESSION_THREADS
  );

  console.timeEnd("🗜️ Compression phase");
  console.time("📤 Upload phase");

  console.log(
    "Compression done! Compressed ",
    preparedImages.length,
    " images"
  );
  //
  // KEY SECTION: here we actually upload everything to db
  //
  //

  const filteredImages = preparedImages.filter((img): img is PreparedImage =>
    Boolean(img)
  );
  await runWithConcurrency(
    filteredImages.map(
      (img) => () =>
        uploadImageToSupabase(
          img.variants.medium.file,
          img.bestEffortBlock,
          img.newImage,
          img.variants.full.file,
          img.variants.thumb.file
        )
          .then((block_id) => {
            if (!block_id) throw new Error("No block_id returned");
            successfulUploads++;
            updateColumns((prevCols) =>
              prevCols.map((col) =>
                col.map((block) =>
                  block.block_id === img.tempBlockId
                    ? {
                        ...block,
                        block_id: block_id, // NOTE: we grab set real block_id
                        data: {
                          ...(block.data as MudboardImage),
                          uploadStatus: "uploaded",
                        },
                      }
                    : block
                )
              )
            );
          })
          .catch((err) => {
            console.error(err);
            // failedUploads++;
            updateColumns((prevCols) =>
              prevCols.map((col) =>
                col.map((block) =>
                  block.block_id === img.tempBlockId
                    ? {
                        ...block,
                        data: {
                          ...(block.data as MudboardImage),
                          uploadStatus: "error",
                        },
                      }
                    : block
                )
              )
            );
          })
    ),
    UPLOAD_THREADS
  );

  console.timeEnd("📤 Upload phase");
  useLoadingStore.setState({ isUploading: false });

  toast.dismiss(toastId);
  if (successfulUploads > 0) {
    // we may have incorrect versions of the order, so trigger a sync
    useLayoutStore.setState({ layoutDirty: true });
    toast.success(
      `Successfully uploaded ${successfulUploads} of ${totalUploads} images!`
    );
  }

  console.log(`Upload ${preparedImages.length} images complete!`);
}
