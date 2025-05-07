import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { convertToWebP } from "@/lib/process-images/compress-image";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/lib/db-actions/upload-image";
import {
  allowedMimeTypes,
  MAX_IMAGE_WIDTH,
  COMPRESSED_IMAGE_WIDTH,
  COMPRESSED_THUMB_WIDTH,
  DEFAULT_FILE_EXT,
  DEFAULT_BOARD_ID,
} from "@/types/upload-settings";
import {
  Block,
  BlockInsert,
  BlockType,
  MudboardImage,
} from "@/types/image-type";
import {
  findShortestColumn,
  getNextRowIndex,
} from "@/lib/columns/column-helpers";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import { generateBlurhashFromImage } from "@/lib/process-images/blur-hash";

export function useImageImport({
  columns,
  updateColumns,
  setIsDragging,
  setDraggedFileCount,
}: {
  columns: Block[][];
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDraggedFileCount: (count: number | null) => void;
}) {
  const spacingSize = useUIStore((s) => s.spacingSize);

  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // handling importing images
  useEffect(() => {
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

        const uploadPromises = Array.from(files).map(async (file) => {
          const image_id = uuidv4();

          const match = file.name.match(/^(.*)\.([^.]+)$/);
          const original_name = match ? match[1] : file.name;
          const fileExt = match ? match[2].toLowerCase() : null; // just used to check

          if (!fileExt) {
            throw new Error("Could not determine file extension.");
          }

          if (!allowedMimeTypes.includes(file.type)) {
            toast.error(`Unsupported file type: ${file.type}`);
            return;
          }

          // SECTION: image compression
          //

          let largestImage;
          let compressedImage;
          let thumbImage;
          try {
            largestImage = await convertToWebP(file, MAX_IMAGE_WIDTH);
            compressedImage = await convertToWebP(
              largestImage.file,
              COMPRESSED_IMAGE_WIDTH,
              0.6
            );
            thumbImage = await convertToWebP(
              largestImage.file,
              COMPRESSED_THUMB_WIDTH,
              0.5
            );
          } catch (err) {
            toast.error(
              "Image conversion failed. Please try a different file."
            );
            console.log("Image Conversion failed: ", err);
            return;
          }
          const { file: compressedFile, width, height } = compressedImage;

          // create an objectURL so we can use it locally
          const objectUrl = URL.createObjectURL(largestImage.file);

          // SECTION: Generate blurhash
          let blurhash: string | undefined;
          try {
            const thumbImg = new Image();
            thumbImg.src = URL.createObjectURL(thumbImage.file);

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

          const newImage: MudboardImage = {
            image_id,
            file_ext: DEFAULT_FILE_EXT,
            original_name,
            width,
            caption: original_name,
            blurhash,

            fileName: objectUrl, // the local file
            fileType: "blob",
            uploadStatus: "uploading",
          };

          // SECTION: updating block
          //

          const tempBlockId = `temp-${uuidv4()}`;
          const incompleteBlock = {
            board_id: DEFAULT_BOARD_ID,
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

          // KEY SECTION: here we actually upload everything to db
          //
          return uploadImageToSupabase(
            compressedFile,
            bestEffortBlock,
            newImage,
            largestImage.file,
            thumbImage.file
          )
            .then((block_id) => {
              successfulUploads++;
              updateColumns((prevCols) =>
                prevCols.map((col) =>
                  col.map((block) =>
                    block.block_id === tempBlockId
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
                    block.block_id === newImage.image_id
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
            });
        });

        await Promise.all(uploadPromises);
        // we may have incorrect versions of the order, so trigger a sync
        toast.success(
          `Successfully uploaded ${successfulUploads} of ${uploadPromises.length} images!`
        );
        console.log(`All ${uploadPromises.length} uploads complete!`);
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
  }, []);
}
