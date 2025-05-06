"use client";
import Gallery from "./gallery";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./sidebar";
import { Block } from "@/types/image-type";
import { fetchSupabaseImages as fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-images";
import { useImageImport } from "@/hooks/use-import-images";
import { DEFAULT_COLUMNS } from "@/types/constants";
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { DEFAULT_BOARD_ID } from "@/types/upload-settings";
import { useLayoutStore } from "@/store/layout-store";

export default function Home() {
  const [flatBlocks, setFlatBlocks] = useState<Block[]>([]);

  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [numCols, setNumCols] = useState(DEFAULT_COLUMNS);
  const [columns, setColumns] = useState<Block[][]>([]);
  console.log(setNumCols);

  // helper function (so I don't forget setting layout dirty)
  const updateColumns = (fn: (prev: Block[][]) => Block[][]) => {
    useLayoutStore.getState().setLayoutDirty(true);
    setColumns(fn);
  };

  // SECTION: Getting all the initial images
  //

  // load all images on init
  useEffect(() => {
    async function loadImages() {
      const blocks = await fetchSupabaseBlocks();
      setFlatBlocks(blocks);
    }

    loadImages();
  }, []);

  // generate the columns. sort by row and column index
  const generatedColumns = useMemo(() => {
    const newColumns: Block[][] = Array.from({ length: numCols }, () => []);

    flatBlocks.forEach((block) => {
      const col = Math.min(block.col_index ?? 0, numCols - 1);
      newColumns[col]?.push(block);
    });

    newColumns.forEach((col) =>
      col.sort((a, b) => (a.row_index ?? 0) - (b.row_index ?? 0))
    );

    return newColumns;
  }, [flatBlocks, numCols]);

  // update the fake columns with the real ones if reals ones change
  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

  //
  //
  // SECTION: Everything to do with block order
  //

  // syncing order to database
  useEffect(() => {
    const interval = setInterval(() => {
      if (useLayoutStore.getState().layoutDirty) {
        syncOrderToSupabase(columns, DEFAULT_BOARD_ID); // pass in current layout
        useLayoutStore.getState().setLayoutDirty(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [columns]);

  // save the block order
  const blockMap = useMemo(() => {
    console.log("colums just updated. changing blockmap. cols: ", columns);

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

  // SECTION: When you drag and drop and image
  //

  // handling importing images
  useImageImport({
    columns,
    updateColumns,
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
          updateColumns={updateColumns}
          blockMap={blockMap}
        />
      </main>
    </div>
  );
}
