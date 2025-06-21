// this component is everything inside the "change look" dropdown
// (or whatever I ended up to naming it....)
// it's the "mirror mode" button and the slider to change column number

// I really do need to come up with a better name for it

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
import { toast } from "sonner";
import { FaCopy } from "react-icons/fa6";
import { BOARD_BASE_URL } from "@/types/constants";

export default function CustomizeSection() {
  const board = useMetadataStore((s) => s.board);

  const [thumbnailPreviewOpen, setThumbnailPreviewOpen] = useState(false);
  const extThumbnailUrl = useThumbnailStore((s) => s.extThumbnailUrl);

  const thumbnailWidth = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width;
  const thumbnailHeight = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height;
  const extAspect = thumbnailWidth / thumbnailHeight;

  const generateThumbnails = useThumbnailStore((s) => s.generateThumbnail);

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
              <button
                type="button"
                title="Share Board"
                data-umami-event={`App: Share (Copy Link)`}
                onClick={() => {
                  const url = `${BOARD_BASE_URL}/${board?.board_id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    console.log("Copied to clipboard:", url);
                  });
                  toast.success("Copied Board Link!");
                }}
                className="flex items-center px-2 mt-2 mb-1 gap-1 text-white text-sm font-bold font-header
            cursor-pointer hover:text-accent transition-all duration-300"
              >
                <FaCopy />
                Copy Board Link
              </button>

              <button
                type="button"
                onClick={() => {
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
