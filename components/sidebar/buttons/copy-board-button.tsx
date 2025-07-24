import { BOARD_BASE_URL } from "@/types/constants";
import React from "react";
import { FaLink } from "react-icons/fa6";
import { toast } from "sonner";

export default function CopyBoardLinkButton({
  boardId,
  className,
}: {
  boardId: string;
  className: string;
}) {
  return (
    <button
      type="button"
      title="Share Board"
      aria-label="Copy Board Share Link"
      data-umami-event={`App: Share (Copy Link)`}
      onClick={() => {
        const url = `${BOARD_BASE_URL}/${boardId}`;
        navigator.clipboard.writeText(url).then(() => {
          console.log("Copied to clipboard:", url);
        });
        toast.success("Copied Board Link!");
      }}
      className={`flex items-center gap-1 cursor-pointer ${className}`}
    >
      <FaLink />
      Copy Board Link
    </button>
  );
}
