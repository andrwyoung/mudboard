import { useEffect, useRef, useState } from "react";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { checkThumbnailExists } from "@/lib/db-actions/thumbnails/check-thumbnail-exists";
import { THUMBNAIL_REGENERATION_DELAY } from "@/types/upload-settings";
import { NUM_SECTION_TO_CHECK } from "@/types/constants";
import { useThumbnailStore } from "@/store/thumbnail-store";

export function useOffshoreThumbnailGenerator(boardId: string) {
  const generateThumbnails = useThumbnailStore((s) => s.generateThumbnail);

  const [regenerationQueued, setRegenerationQueued] = useState(false);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // check if the first 3 sections have changed
  const boardSections = useMetadataStore((s) => s.boardSections);
  const isThumbnailDirty = useLayoutStore((state) => {
    const layoutMap = state.layoutDirtyMap;
    return boardSections
      .slice(0, NUM_SECTION_TO_CHECK)
      .some((s) => layoutMap[s.section.section_id] === true);
  });

  // if there doesn't exist a thumbnail yet, then generate
  useEffect(() => {
    const maybeGenerate = async () => {
      const exists = await checkThumbnailExists(boardId, "board-thumb-ext");
      if (!exists) {
        console.log("No thumbnail found. Generating...");
        setRegenerationQueued(true);
      }
    };
    maybeGenerate();
  }, [boardId]);

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

  // once things have settled down, and things are no longer changing, then regenerate the thumbnails
  useEffect(() => {
    if (!regenerationQueued) return;
    const timeout = setTimeout(() => {
      generateThumbnails(boardId);
      setRegenerationQueued(false);
    }, THUMBNAIL_REGENERATION_DELAY);
    return () => clearTimeout(timeout);
  }, [regenerationQueued, generateThumbnails, boardId]);
}
