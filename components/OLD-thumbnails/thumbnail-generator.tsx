// KEY FILE: this is where all the thumbnail generation things "dock"

// how this works:
// in this file we render some canvases wayyy offscreen
// then we call a function in thumbnail-store.tsx that "captures" that image and uploads it

import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  THUMBNAIL_COLUMNS,
  THUMBNAIL_REGENERATION_DELAY,
} from "@/types/upload-settings";
import { checkThumbnailExists } from "@/lib/db-actions/thumbnails/check-thumbnail-exists";
import OLDExternalThumbnail from "./external-thumbnail";
import OLDDashboardThumbnail from "./dashboard-thumbnail";
import { Block } from "@/types/block-types";
import {
  DEFAULT_BOARD_TITLE,
  NUM_BLOCKS_TO_GRAB,
  NUM_SECTION_TO_CHECK,
} from "@/types/constants";
import { OLDuseThumbnailStore } from "@/store/OLD-thumbnail-store";
import { Board } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";

export type ThumbnailGeneratorHandle = {
  generate: () => void;
};

export default function OLDThumbnailGenerator({ board }: { board: Board }) {
  const externalRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const generateThumbnails = OLDuseThumbnailStore((s) => s.generateThumbnail);
  const dashThumbnailUrl = OLDuseThumbnailStore((s) => s.dashThumbnailUrl);
  const extThumbnailUrl = OLDuseThumbnailStore((s) => s.extThumbnailUrl);

  const masterBlockOrder = useLayoutStore((s) => s.masterBlockOrder);

  // scheduling a regeneration time
  const [regenerationQueued, setRegenerationQueued] = useState(false);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const boardSections = useMetadataStore((s) => s.boardSections);
  const section = boardSections[0].section;

  const columnsToRender =
    section.saved_column_num >= 3 && section.saved_column_num <= 5
      ? section.saved_column_num
      : THUMBNAIL_COLUMNS;

  const isThumbnailDirty = useLayoutStore((state) => {
    const layoutMap = state.layoutDirtyMap;
    return boardSections
      .slice(0, NUM_SECTION_TO_CHECK)
      .some((s) => layoutMap[s.section.section_id] === true);
  });

  const allBlocks: PositionedBlock[] = useMemo(() => {
    const blocks: PositionedBlock[] = [];

    // sort defensively
    const sortedSections = [...boardSections].sort(
      (a, b) => a.order_index - b.order_index
    );

    for (const section of sortedSections) {
      const sectionBlocks = masterBlockOrder[section.section.section_id] ?? [];

      for (const block of sectionBlocks) {
        blocks.push(block);
        if (blocks.length === NUM_BLOCKS_TO_GRAB) break;
      }

      if (blocks.length === NUM_BLOCKS_TO_GRAB) break;
    }

    return blocks;
  }, [boardSections, masterBlockOrder]);

  const blocks: Block[][] = useMemo(() => {
    const imageBlocks = allBlocks
      .map((b) => b.block)
      .filter((block) => block.block_type === "image");

    const cols: Block[][] = Array.from({ length: columnsToRender }, () => []);

    imageBlocks.forEach((block, i) => {
      const colIndex = i % columnsToRender;
      cols[colIndex].push(block);
    });

    return cols;
  }, [columnsToRender, allBlocks]);

  // mount the refs to the generator store
  useEffect(() => {
    OLDuseThumbnailStore.getState().setExternalRef(externalRef);
    OLDuseThumbnailStore.getState().setDashboardRef(dashboardRef);
  }, []);

  // if no thumbnail exists on mount, queue a regeneration
  useEffect(() => {
    const maybeGenerate = async () => {
      const exists = await checkThumbnailExists(
        board.board_id,
        "board-thumb-ext"
      );

      if (!exists) {
        console.log("No thumbnail found. Generating...");
        setRegenerationQueued(true);
      }
    };

    maybeGenerate();
  }, [board]);

  // queuing regeneration if layout dirty has been changed
  useEffect(() => {
    if (isThumbnailDirty) {
      // Dirty: cancel any pending regeneration
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
      setThumbnailReady(true); // we're waiting for clean
      return;
    }

    // Only schedule if we were ready and things are now clean
    if (thumbnailReady) {
      debounceTimeout.current = setTimeout(() => {
        setRegenerationQueued(true);
        setThumbnailReady(false); // reset the state
      }, 1000); // debounce time after becoming clean
    }
  }, [isThumbnailDirty, thumbnailReady]);

  // actually run generation
  useEffect(() => {
    if (!regenerationQueued || !board) return;

    const timeout = setTimeout(() => {
      generateThumbnails(board.board_id);
      setRegenerationQueued(false);
    }, THUMBNAIL_REGENERATION_DELAY);

    return () => clearTimeout(timeout);
  }, [regenerationQueued, generateThumbnails, board]);

  return (
    <div>
      {/* {process.env.NODE_ENV === "development"  && (
        <div className="p-4">
          <button
            type="button"
            onClick={() => generateThumbnails(board?.board_id)}
            className="px-2 py-1 cursor-pointer bg-accent text-primary text-xs
         hover:bg-white transition-all duration-200 rounded-sm"
          >
            Generate Thumbnail
          </button>
          // 
        </div>
      )} */}

      {false && dashThumbnailUrl && extThumbnailUrl && (
        <div className="mt-4">
          {/* <Image
            src={dashThumbnailUrl}
            alt="Generated thumbnail"
            height={THUMBNAIL_ASPECT_MAP["board-thumb-dashboard"].height}
            width={THUMBNAIL_ASPECT_MAP["board-thumb-dashboard"].width}
          />
          <Image
            src={extThumbnailUrl}
            alt="Generated thumbnail"
            height={THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height}
            width={THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width}
          /> */}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "-10000px", // moves it far out of view
          left: "-10000px",
        }}
      >
        <div ref={externalRef}>
          <OLDExternalThumbnail
            blocks={blocks}
            title={board.title ?? DEFAULT_BOARD_TITLE}
            columns={columnsToRender}
          />
        </div>
        <div ref={dashboardRef}>
          <OLDDashboardThumbnail blocks={blocks} columns={columnsToRender} />
        </div>
      </div>
    </div>
  );
}
