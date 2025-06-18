import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  THUMBNAIL_COLUMNS,
  THUMBNAIL_REGENERATION_DELAY,
} from "@/types/upload-settings";
import { checkThumbnailExists } from "@/lib/db-actions/thumbnails/check-thumbnail-exists";
import ExternalThumbnail from "./external-thumbnail";
import { generateThumbnailFromRef } from "@/lib/thumbnail/generate-canvas-thumbnail";
import DashboardThumbnail from "./dashboard-thumbnail";
import { Block } from "@/types/block-types";
import { DEFAULT_BOARD_TITLE } from "@/types/constants";

export default function ThumbnailGenerator() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const board = useMetadataStore((s) => s.board);
  const layoutDirty = useLayoutStore((state) => state.layoutDirty);
  const externalRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const [regenerationQueued, setRegenerationQueued] = useState(false);
  const masterBlockOrder = useLayoutStore((s) => s.masterBlockOrder);

  const boardSections = useMetadataStore((s) => s.boardSections);
  const section = boardSections[0].section;

  const columnsToRender =
    section.saved_column_num >= 3 && section.saved_column_num <= 5
      ? section.saved_column_num
      : THUMBNAIL_COLUMNS;

  const blocks: Block[][] = useMemo(() => {
    const allBlocks = (masterBlockOrder ?? []).slice(0, 30);
    const imageBlocks = allBlocks
      .map((b) => b.block)
      .filter((block) => block.block_type === "image");

    const cols: Block[][] = Array.from({ length: columnsToRender }, () => []);

    imageBlocks.forEach((block, i) => {
      const colIndex = i % columnsToRender;
      cols[colIndex].push(block);
    });

    return cols;
  }, [masterBlockOrder, columnsToRender]);

  // function that actually generates thumbnail
  const handleGenerateThumbnail = useCallback(async () => {
    if (!board || !dashboardRef.current || !externalRef.current) return;

    generateThumbnailFromRef({
      element: externalRef.current,
      boardId: board.board_id,
      thumbnailType: "board-thumb-ext",
    });

    const miniviewThumbnail = await generateThumbnailFromRef({
      element: dashboardRef.current,
      boardId: board.board_id,
      thumbnailType: "board-thumb-dashboard",
    });

    if (miniviewThumbnail) setThumbnailUrl(miniviewThumbnail);
  }, [board, dashboardRef]);

  useEffect(() => {
    if (!board) return;

    const maybeGenerate = async () => {
      const exists = await checkThumbnailExists(
        board.board_id,
        "board-thumb-ext"
      );

      if (!exists) {
        console.log("No thumbnail found. Queuing...");
        setRegenerationQueued(true);
      }
    };

    maybeGenerate();
  }, [board]);

  // queuing regeneration
  useEffect(() => {
    if (layoutDirty && !regenerationQueued) {
      setRegenerationQueued(true);
    }
  }, [layoutDirty, handleGenerateThumbnail, regenerationQueued]);

  useEffect(() => {
    if (!regenerationQueued) return;

    const timeout = setTimeout(() => {
      handleGenerateThumbnail();
      setRegenerationQueued(false);
    }, THUMBNAIL_REGENERATION_DELAY);

    return () => clearTimeout(timeout);
  }, [regenerationQueued, handleGenerateThumbnail]);

  return (
    <div>
      {false && process.env.NODE_ENV === "development" && (
        <div className="p-4">
          <button
            type="button"
            onClick={handleGenerateThumbnail}
            className="px-2 py-1 cursor-pointer bg-accent text-primary text-xs
         hover:bg-white transition-all duration-200 rounded-sm"
          >
            Generate Thumbnail
          </button>
          {thumbnailUrl && (
            <div className="mt-4">
              {/* <Image
                src={thumbnailUrl}
                alt="Generated thumbnail"
                height={THUMBNAIL_DASHBOARD_HEIGHT}
                width={THUMBNAIL_WIDTH}
              /> */}
            </div>
          )}
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
          <ExternalThumbnail
            blocks={blocks}
            title={board?.title ?? DEFAULT_BOARD_TITLE}
            columns={columnsToRender}
          />
        </div>
        <div ref={dashboardRef}>
          <DashboardThumbnail blocks={blocks} columns={columnsToRender} />
        </div>
      </div>
    </div>
  );
}
