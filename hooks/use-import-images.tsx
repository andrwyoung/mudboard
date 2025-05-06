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
import { Block, BlockType, MudboardImage } from "@/types/image-type";
import {
  findShortestColumn,
  getNextRowIndex,
} from "@/lib/column-helpers/column-helpers";

export function useImageImport({
  columns,
  setColumns,
  setIsDragging,
  setDraggedFileCount,
}: {
  columns: Block[][];
  setColumns: React.Dispatch<React.SetStateAction<Block[][]>>;
  setIsDragging: (isDragging: boolean) => void;
  setDraggedFileCount: (count: number | null) => void;
}) {
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

          // compressing all the images
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

          const newImage: MudboardImage = {
            image_id,
            file_ext: DEFAULT_FILE_EXT,
            original_name,
            width,
            caption: original_name,

            fileName: objectUrl, // the local file
            uploadStatus: "uploading",
          };

          setColumns((prevCols) => {
            const colIndex = findShortestColumn(prevCols);
            const newRowIndex = getNextRowIndex(prevCols[colIndex] ?? []);

            const newBlock = {
              block_id: newImage.image_id,
              board_id: DEFAULT_BOARD_ID,
              block_type: "image" as BlockType,
              data: newImage,
              height,
              col_index: colIndex,
              row_index: newRowIndex,
              deleted: false,
              order_index: 0,
            };

            const newCols = [...prevCols];
            newCols[colIndex] = [...newCols[colIndex], newBlock];
            return newCols;
          });

          // NOTE: this section optimistically orders it
          // we can't get the real order yet since we prioritize async uploads
          // but we count on the norm syncing to fix it soon
          const cols = columnsRef.current;
          const colIndex = findShortestColumn(cols);
          const newRowIndex = getNextRowIndex(cols[colIndex] ?? []);
          const bestEffortBlock = {
            block_id: newImage.image_id,
            board_id: DEFAULT_BOARD_ID,
            block_type: "image" as BlockType,
            data: newImage,
            height,
            col_index: colIndex,
            row_index: newRowIndex,
            deleted: false,
            order_index: 0,
          };

          // here we actually upload everything into the database
          // note we upload all versions
          return uploadImageToSupabase(
            compressedFile,
            bestEffortBlock,
            newImage,
            largestImage.file,
            thumbImage.file
          )
            .then(() => {
              successfulUploads++;
              setColumns((prevCols) =>
                prevCols.map((col) =>
                  col.map((block) =>
                    block.block_id === newImage.image_id
                      ? {
                          ...block,
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
              setColumns((prevCols) =>
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
