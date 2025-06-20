// this component is everything inside the "change look" dropdown
// (or whatever I ended up to naming it....)
// it's the "mirror mode" button and the slider to change column number

// I really do need to come up with a better name for it

import { CheckField } from "../ui/check-field";
import { changeBoardPermissions } from "@/lib/db-actions/change-board-permissions";
import { useMetadataStore } from "@/store/metadata-store";
import { useThumbnailStore } from "@/store/thumbnail-store";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import {
  THUMBNAIL_ASPECT_MAP,
  THUMBNAIL_COLUMNS,
} from "@/types/upload-settings";
import InfoTooltip from "../ui/info-tooltip";

export default function CustomizeSection() {
  const board = useMetadataStore((s) => s.board);
  const openToPublic = board?.access_level === "public";

  const [thumbnailPreviewOpen, setThumbnailPreviewOpen] = useState(false);
  const extThumbnailUrl = useThumbnailStore((s) => s.extThumbnailUrl);

  const thumbnailWidth = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width;
  const thumbnailHeight = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height;
  const extAspect = thumbnailWidth / thumbnailHeight;

  const generateThumbnails = useThumbnailStore((s) => s.generateThumbnail);
  const boardUnclaimed = board !== null && board.user_id === null;

  return (
    <>
      <div className=" flex flex-col gap-4 ">
        <div className="flex flex-col gap-1 self-center w-full">
          {!boardUnclaimed && (
            <div className="px-2">
              <CheckField
                text="Allow anyone to edit"
                title="Allow anyone to edit"
                isChecked={openToPublic}
                onChange={(checked) => {
                  changeBoardPermissions(checked ? "public" : "private");
                }}
              />
            </div>
          )}

          {board && (
            <button
              type="button"
              onClick={() => {
                setThumbnailPreviewOpen(true);
                generateThumbnails(board?.board_id);
              }}
              className="ml-2 px-2 py-1 w-fit cursor-pointer text-white hover:underline hover:text-accent text-xs
          transition-all duration-200 rounded-sm"
            >
              Manually Update Thumbnail
            </button>
          )}
        </div>
      </div>

      <Dialog
        open={thumbnailPreviewOpen}
        onOpenChange={setThumbnailPreviewOpen}
      >
        <DialogContent className="flex flex-col items-center gap-4">
          <DialogTitle>
            <span
              className="flex flex-row gap-2 items-center font-header text-xl
            text-primary font-semibold"
            >
              External Thumbnail
              <InfoTooltip
                text={`This is the preview image shown when you share the board link. Only layouts with 3-5 saved columns are supported, so if your board’s saved layout uses more or fewer columns,
                   it will be rendered with ${THUMBNAIL_COLUMNS} columns instead`}
              />
            </span>
          </DialogTitle>

          {extThumbnailUrl ? (
            <Image
              src={extThumbnailUrl}
              alt="External thumbnail"
              width={thumbnailWidth}
              height={thumbnailHeight}
              className="rounded shadow"
            />
          ) : (
            <div
              className="relative w-full flex items-center justify-center
              font-header text-primary font-semibold border border-primary rounded-md"
              style={{ aspectRatio: extAspect }}
            >
              Generating Thumbnail...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
