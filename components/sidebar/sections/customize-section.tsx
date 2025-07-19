// this component renders that "Board options" dropdown

import { useMetadataStore } from "@/store/metadata-store";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import Image from "next/image";
import {
  THUMBNAIL_ASPECT_MAP,
  THUMBNAIL_COLUMNS,
} from "@/types/upload-settings";
import InfoTooltip from "../../ui/info-tooltip";
import { useThumbnailStore } from "@/store/thumbnail-store";
import { useLayoutStore } from "@/store/layout-store";
import CopyBoardLinkButton from "../buttons/copy-board-button";

export default function CustomizeSection() {
  const board = useMetadataStore((s) => s.board);

  const [thumbnailPreviewOpen, setThumbnailPreviewOpen] = useState(false);
  const extThumbnailUrl = useThumbnailStore((s) => s.extThumbnailUrl);
  const generateThumbnails = useThumbnailStore((s) => s.generateThumbnail);

  const syncLayout = useLayoutStore((s) => s.syncLayout);

  const thumbnailWidth = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width;
  const thumbnailHeight = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height;
  const extAspect = thumbnailWidth / thumbnailHeight;

  return (
    <>
      <div className=" flex flex-col gap-4 ">
        <div className="flex flex-col gap-1 self-center w-full">
          {/* {!boardUnclaimed && (
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
          )} */}

          {board && (
            <div className="px-2">
              <CopyBoardLinkButton
                boardId={board.board_id}
                className="px-2 mt-2 mb-1 text-white text-sm font-bold font-header
                 hover:text-accent transition-all duration-100"
              />

              <button
                type="button"
                onClick={async () => {
                  await syncLayout(); // sync the order so it's correct
                  setThumbnailPreviewOpen(true);
                  generateThumbnails(board?.board_id);
                }}
                className="ml-2 py-1 w-fit cursor-pointer text-white hover:underline hover:text-accent text-xs
          transition-all duration-200 rounded-sm"
              >
                Manually Update Thumbnail
              </button>
            </div>
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

          <div className="flex flex-col items-center gap-4">
            {extThumbnailUrl ? (
              <Image
                src={`${extThumbnailUrl}?t=${Date.now()}`} // cache buster
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

            {board && (
              <CopyBoardLinkButton
                boardId={board.board_id}
                className="px-2 mt-2 text-primary text-sm font-bold font-header
          hover:text-accent transition-all duration-100"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
