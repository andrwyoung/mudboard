"use client";
import Gallery from "./gallery";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./sidebar";
import { Block, MudboardImage } from "@/types/image-type";
import { fetchSupabaseImages } from "@/lib/db-actions/fetch-db-images";
import { useImageImport } from "@/hooks/use-import-images";
import { DEFAULT_COLUMNS, INDEX_MULTIPLIER } from "@/types/constants";
import { DEFAULT_BOARD_ID } from "@/types/upload-settings";

export default function Home() {
  const [orderedImages, setOrderedImages] = useState<MudboardImage[]>([]);

  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [numCols, setNumCols] = useState(DEFAULT_COLUMNS);
  const [columns, setColumns] = useState<Block[][]>([]);

  setNumCols(DEFAULT_COLUMNS);

  // load all images on init
  useEffect(() => {
    async function loadImages() {
      const images = await fetchSupabaseImages();
      setOrderedImages(images);
    }

    loadImages();
  }, []);

  // only regenerate "real" columns when backend images change
  const generatedColumns = useMemo(() => {
    const newColumns: Block[][] = Array.from({ length: numCols }, () => []);
    orderedImages.forEach((img, index) => {
      const colIndex = index % numCols;
      const rowIndex = newColumns[colIndex].length;

      newColumns[colIndex].push({
        block_id: img.image_id, // not technically correct

        board_id: DEFAULT_BOARD_ID,

        block_type: "image",
        image_id: img.image_id,
        data: img,

        col_index: colIndex,
        row_index: rowIndex * INDEX_MULTIPLIER,
        deleted: false,
      });
    });
    return newColumns;
  }, [orderedImages, numCols]);

  // update the fake columns with the real ones if reals ones change
  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

  // save the block order
  const blockMap = useMemo(() => {
    const map = new Map<string, { colIndex: number; blockIndex: number }>();
    columns.forEach((col, colIndex) => {
      col.forEach((block, blockIndex) => {
        if (!block.deleted) {
          map.set(block.block_id, { colIndex, blockIndex });
        }
      });
    });
    return map;
  }, [columns]);

  // handling importing images
  useImageImport({
    columns,
    setColumns,
    setIsDragging: setIsDraggingFile,
    setDraggedFileCount,
  });

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isDraggingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white text-2xl">
          {draggedFileCount
            ? `Drop ${draggedFileCount} file${draggedFileCount > 1 ? "s" : ""}!`
            : "Drop your file!"}
        </div>
      )}

      {/* Sidebar */}
      <aside
        className="hidden lg:block w-1/6 min-w-[200px] max-w-[380px]
      bg-primary"
      >
        <Sidebar />
      </aside>

      {/* Gallery */}
      <main className="flex-1 overflow-y-scroll scrollbar-none">
        <Gallery
          columns={columns}
          setColumns={setColumns}
          blockMap={blockMap}
        />
      </main>
    </div>
  );
}
