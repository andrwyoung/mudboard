import { BoardWithStats } from "@/types/stat-types";
import { cn } from "@/utils/utils";

type Props = {
  board: BoardWithStats;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
};

export function BoardSelectButton({
  board,
  isSelected,
  onClick,
  onDoubleClick,
}: Props) {
  const { board_id, title, block_count, section_count } = board;

  return (
    <button
      key={board_id}
      type="button"
      className={cn(
        `w-full justify-start border-2 border-transparent font-header transition-all 
        duration-150 px-2 py-1 group rounded-md text-primary `,
        isSelected
          ? "bg-accent/80 "
          : "bg-transparent hover:bg-accent/30 hover:border-accent/50 cursor-pointer"
      )}
      onClick={() => {
        if (process.env.NODE_ENV === "development") {
          navigator.clipboard.writeText(board_id);
        }
        onClick();
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex flex-row justify-between items-center gap-6">
        <div className="text-start flex-1 min-w-0">
          <h3 className={cn("text-sm truncate", !title && "italic opacity-80")}>
            {title || "Untitled Board"}
          </h3>
        </div>

        <div className="grid grid-cols-[auto_auto] w-64 gap-x-2 text-xs font-header font-medium">
          <p>Sections: {section_count}</p>
          <p>Blocks: {block_count}</p>
        </div>
      </div>
    </button>
  );
}
