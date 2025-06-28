import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";
import { setVisualNumCols } from "@/lib/local-actions/set-visual-columns";
import { FaSave } from "react-icons/fa";
import { cn } from "@/utils/utils";
import { updateSectionColumnNum } from "@/lib/db-actions/update-section-columns";

type Props = {
  sectionId: string;
  visualNumCols: number;
  savedColumnNum: number;
  canEdit: boolean;
};

export default function SectionColumnSelector({
  sectionId,
  visualNumCols,
  savedColumnNum,
  canEdit,
}: Props) {
  return (
    <div className="flex flex-row-reverse items-center gap-2">
      {canEdit && visualNumCols !== savedColumnNum && (
        <FaSave
          className="cursor-pointer hover:text-accent transition-all duration-200"
          title="Save Number of Columns"
          onClick={() =>
            updateSectionColumnNum(sectionId, visualNumCols, canEdit)
          }
        />
      )}
      <Select
        value={visualNumCols.toString()}
        onValueChange={(val) => {
          const newVal = parseInt(val);
          setVisualNumCols(sectionId, newVal);
        }}
      >
        <SelectTrigger id={`select-trigger-${sectionId}`}>
          <div
            className="flex items-center gap-1 font-header text-sm hover:text-accent 
            transition-colors duration-200 "
            title="Change Column Number"
          >
            Columns: {visualNumCols}
          </div>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: MAX_COLUMNS - MIN_COLUMNS + 1 }, (_, i) => {
            const n = i + MIN_COLUMNS;
            const isHighlighted = n === savedColumnNum;

            return (
              <SelectItem key={n} value={n.toString()}>
                <div className="flex items-center gap-1 justify-between w-full">
                  <span
                    className={cn(
                      isHighlighted && n.toString() !== visualNumCols.toString()
                        ? "font-semibold"
                        : ""
                    )}
                  >
                    {n}
                  </span>
                  {isHighlighted &&
                    n.toString() !== visualNumCols.toString() && (
                      <span className="text-xs text-primary italic">saved</span>
                    )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
