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
import { Block, MudboardImage } from "@/types/image-type";
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
            height,
            description: original_name,

            fileName: objectUrl, // the local file
            uploadStatus: "uploading",
          };

          // figuring out block stuff
          const currentCols = columnsRef.current;

          console.log(
            "Current columns:",
            columnsRef.current.map((col) => col?.length)
          );
          const colIndex = findShortestColumn(currentCols);
          const newRowIndex = getNextRowIndex(currentCols[colIndex] ?? []);
          const newBlock: Block = {
            block_id: newImage.image_id,
            board_id: DEFAULT_BOARD_ID,

            block_type: "image",
            data: newImage,

            col_index: colIndex,
            row_index: newRowIndex,
            deleted: false,
          };

          // add it to gallery immediately
          setColumns((prevCols) => {
            const newCols = [...prevCols];
            newCols[colIndex] = [...newCols[colIndex], newBlock];
            return newCols;
          });

          // here we actually upload everything into the database
          // note we upload all versions
          return uploadImageToSupabase(
            compressedFile,
            newBlock,
            newImage,
            largestImage.file,
            thumbImage.file
          )
            .then(() => {
              setColumns((prevCols) =>
                prevCols.map((col) =>
                  col.map((block) =>
                    block.block_id === newImage.image_id
                      ? {
                          ...block,
                          data: {
                            ...block.data,
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
              setColumns((prevCols) =>
                prevCols.map((col) =>
                  col.map((block) =>
                    block.block_id === newImage.image_id
                      ? {
                          ...block,
                          data: {
                            ...block.data,
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
        toast.success(`Successfully uploaded ${uploadPromises.length} images!`);
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
