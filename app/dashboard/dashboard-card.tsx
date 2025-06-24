import Link from "next/link";
import { FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { formatCreationDate, formatUpdateTime } from "@/utils/time-formatters";
import { FaArrowRight } from "react-icons/fa6";
import { getThumbnailUrl } from "@/utils/get-thumbnail-url";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { THUMBNAIL_ASPECT_MAP } from "@/types/upload-settings";
import { BoardWithStats } from "@/types/stat-types";

export default function BoardCard({
  board,
  onDelete,
}: {
  board: BoardWithStats;
  onDelete: () => void;
}) {
  const [fallback, setFallback] = useState(false);
  const thumbUrl = fallback
    ? "/2.png"
    : getThumbnailUrl(board.board_id, "board-thumb-dashboard");

  const router = useRouter();
  const href = `/b/${board.board_id}`;

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      className="rounded-md bg-background shadow-lg flex flex-col justify-between text-primary-darker relative overflow-hidden 
    hover:scale-101 transition-all duration-200 cursor-pointer"
      title="Go to Board"
      onClick={handleClick}
    >
      {!fallback && (
        <>
          <div className="absolute bottom-0 left-0 w-full h-3/8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-full h-3/8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-full h-3/8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </>
      )}

      <div className="flex justify-between mx-4 my-2 z-20">
        <div className=" flex flex-col">
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="text-xl text-primary font-header cursor-pointer hover:text-accent transition-all duration-300"
          >
            {board.title ?? "Untitled Board"}
          </Link>
          <p className="text-xs text-primary font-bold">
            {board.section_count ?? 0} sections • {board.block_count ?? 0}{" "}
            blocks
          </p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <FaTrashAlt
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Board"
            className="text-primary hover:text-rose-400 transition-colors cursor-pointer"
          />
        </div>
      </div>

      <Image
        src={thumbUrl}
        width={THUMBNAIL_ASPECT_MAP["board-thumb-dashboard"].width}
        height={THUMBNAIL_ASPECT_MAP["board-thumb-dashboard"].height}
        alt={`${board.title} Dashboard Thumbnail`}
        onError={() => setFallback(true)}
        className={`object-cover opacity-90 ${
          fallback ? "-translate-y-13 scale-90" : ""
        }`}
      />

      <div className="flex flex-row-reverse justify-between mb-4 absolute bottom-0 w-full px-6 z-20">
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-header bg-primary px-3 py-1 rounded-lg cursor-pointer 
            flex flex-row gap-1.5 items-center justify-center transition-all duration-300 
            hover:text-primary hover:bg-accent text-white"
          title="Open Board"
        >
          Open
          <FaArrowRight />
        </Link>

        <div className="text-xs">
          <p>Created: {formatCreationDate(board.created_at)}</p>
          <p>
            Last Updated:{" "}
            {board.updated_at ? formatUpdateTime(board.updated_at) : "Never"}
          </p>
        </div>
      </div>
    </div>
  );
}
