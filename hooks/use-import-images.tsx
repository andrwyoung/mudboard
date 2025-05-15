import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CompressedImage,
  convertToWebP,
} from "@/lib/process-images/compress-image";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/lib/db-actions/upload-image";
import {
  allowedMimeTypes,
  DEFAULT_FILE_EXT,
  imageNames,
  UPLOAD_THREADS,
  COMPRESSION_THREADS,
} from "@/types/upload-settings";
import {
  Block,
  BlockInsert,
  BlockType,
  MudboardImage,
} from "@/types/block-types";
import {
  findShortestColumn,
  getNextRowIndex,
} from "@/lib/columns/column-helpers";
import { useUIStore } from "@/store/ui-store";
import { generateBlurhashFromImage } from "@/lib/process-images/blur-hash";
import { runWithConcurrency } from "@/lib/concurrency-helper";

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

export function useImageImport({
  sectionId,
  boardId,
  columns,
  updateColumns,
  setIsDragging,
  setDraggedFileCount,
  setIsUploading,
}: {
  sectionId: string;
  boardId: string;
  columns: Block[][];
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDraggedFileCount: (count: number | null) => void;
  setIsUploading: (e: boolean) => void;
}) {
  const spacingSize = useUIStore((s) => s.spacingSize);

  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // handling importing images
  useEffect(() => {
    if (!sectionId) return;
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      const items = e.dataTransfer?.items;

      if (items && [...items].some((item) => item.kind === "file")) {
        dragCounter++;
        setIsDragging(true);
        setDraggedFileCount(items.length);
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
    }

    async function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter = 0;
      let successfulUploads = 0;
      let failedUploads = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      setDraggedFileCount(null);

      if (files && files.length > 0) {
        setDraggedFileCount(files.length);

        console.time("🗜️ Compression phase");
        setIsUploading(true);

        const compressionTasks = Array.from(files).map((file) => async () => {
          const image_id = uuidv4();

          const match = file.name.match(/^(.*)\.([^.]+)$/);
          const original_name = match ? match[1] : file.name;
          const fileExt = match ? match[2].toLowerCase() : null; // just used to check

          if (!fileExt || !allowedMimeTypes.includes(file.type)) {
            toast.error(`Unsupported file type: ${file.type}`);
            return;
          }

          // SECTION: image compression
          //

          let variants: Record<imageNames, CompressedImage>;
          try {
            variants = await convertToWebP(file);
          } catch (err) {
            toast.error(
              "Image conversion failed. Please try a different file."
            );
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
          const { width, height } = variants.medium;

          const newImage: MudboardImage = {
            image_id,
            file_ext: DEFAULT_FILE_EXT,
            original_name,
            caption: original_name,
            width,
            blurhash,

            fileName: objectUrl, // the local file
            fileType: "blob",
            uploadStatus: "uploading",
          };

          console.log("sectionId: ", sectionId);

          const tempBlockId = `temp-${uuidv4()}`;
          const incompleteBlock = {
            section_id: sectionId,
            board_id: boardId,
            block_type: "image" as BlockType,
            height,

            deleted: false,
          };

          // here we add it to local layout so we can immediately interact
          updateColumns((prevCols) => {
            const colIndex = findShortestColumn(prevCols, spacingSize);
            const rowIndex = getNextRowIndex(
              prevCols[colIndex] ?? [],
              spacingSize
            );

            const newBlock: Block = {
              block_id: tempBlockId,

              ...incompleteBlock,
              data: newImage,

              col_index: colIndex,
              row_index: rowIndex,
              order_index: 0,
            };

            const newCols = [...prevCols];
            newCols[colIndex] = [...newCols[colIndex], newBlock];
            return newCols;
          });

          // best effort block
          // optimistically generate order and columns
          const cols = columnsRef.current;
          const optimisticColIndex = findShortestColumn(cols, spacingSize);
          const optimisticRowIndex = getNextRowIndex(
            cols[optimisticColIndex] ?? [],
            spacingSize
          );
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

        const preparedImages = await runWithConcurrency<
          PreparedImage | undefined
        >(compressionTasks, COMPRESSION_THREADS);

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

        const filteredImages = preparedImages.filter(
          (img): img is PreparedImage => Boolean(img)
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
                  failedUploads++;
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
        setIsUploading(false);

        // we may have incorrect versions of the order, so trigger a sync
        toast.success(
          `Successfully uploaded ${successfulUploads} of ${preparedImages.length} images!`
        );
        console.log(`All ${preparedImages.length} uploads complete!`);
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleDragLeave);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, [sectionId]);
}
