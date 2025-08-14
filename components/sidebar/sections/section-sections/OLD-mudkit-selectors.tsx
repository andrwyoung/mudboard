import { UserBoardSection } from "@/types/board-types";
import { SectionWithStats } from "@/types/stat-types";
import { cn } from "@/utils/utils";
import { FaCube } from "react-icons/fa6";

type Props = {
  section: UserBoardSection | SectionWithStats;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  isGrouped?: boolean;
  disabled?: boolean;
};

export function MudkitSelectButton({
  section,
  isSelected,
  onClick,
  onDoubleClick,
  isGrouped = true,
  disabled = false,
}: Props) {
  const title =
    "section_title" in section ? section.section_title : section.title;
  const sectionId = section.section_id;

  const blockCount = "block_count" in section ? section.block_count : 0;
  const shallowCopyCount =
    "shallow_copy_count" in section ? section.shallow_copy_count : 0;
  const lastCopy = shallowCopyCount && shallowCopyCount <= 1;

  return (
    <button
      key={sectionId}
      type="button"
      disabled={disabled}
      className={cn(
        "w-full justify-start border-2 border-transparent font-header px-2 py-1 group rounded-md",
        disabled
          ? "text-primary opacity-40 cursor-not-allowed"
          : isSelected
          ? "bg-accent/80 text-primary"
          : "bg-transparent text-primary hover:bg-accent/30 hover:border-accent/50 cursor-pointer"
      )}
      onClick={() => {
        if (disabled) return;
        if (process.env.NODE_ENV === "development") {
          navigator.clipboard.writeText(section.section_id);
        }
        onClick();
      }}
      onDoubleClick={disabled ? undefined : onDoubleClick}
    >
      <div className="flex flex-row justify-between items-center gap-6">
        <div className="text-start flex-1 min-w-0">
          <h3 className={cn("text-sm truncate", !title && "italic opacity-90")}>
            {title || "Untitled Section"}
          </h3>
        </div>

        <div className="grid grid-cols-[1fr_1fr_36px] w-30">
          <p className="flex gap-1.5 items-center font-header text-start font-medium text-xs">
            <FaCube className="opacity-60" /> {blockCount}
          </p>
          {isGrouped && (
            <div className="flex justify-end items-center gap-0.5">
              <p className="text-xs font-semibold">
                {!lastCopy && shallowCopyCount}
              </p>
              <div
                title={
                  lastCopy
                    ? "This Section is the only copy"
                    : "This Section used in Multiple Boards"
                }
                className={cn(
                  "w-2 h-2 rounded-full translate-y-[1px]",
                  lastCopy
                    ? isSelected
                      ? "bg-primary-foreground"
                      : "bg-accent group-hover:bg-accent"
                    : "bg-secondary"
                )}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
