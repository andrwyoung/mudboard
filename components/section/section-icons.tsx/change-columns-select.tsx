import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";
import { setVisualColumnNum } from "@/lib/local-actions/set-visual-columns";
import { FaSave } from "react-icons/fa";
import { cn } from "@/utils/utils";
import { updateSectionColumnNum } from "@/lib/db-actions/update-section-columns";

type Props = {
  sectionId: string;
  visualColumnNum: number;
  savedColumnNum: number;
  canEdit: boolean;
};

export default function SectionColumnSelector({
  sectionId,
  visualColumnNum,
  savedColumnNum,
  canEdit,
}: Props) {
  return (
    <div className="flex flex-row-reverse items-center gap-2">
      {canEdit && visualColumnNum !== savedColumnNum && (
        <FaSave
          className="cursor-pointer hover:text-accent transition-all duration-200"
          title="Save Number of Columns"
          onClick={() =>
            updateSectionColumnNum(sectionId, visualColumnNum, canEdit)
          }
        />
      )}
      <Select
        value={visualColumnNum.toString()}
        onValueChange={(val) => {
          const newVal = parseInt(val);
          setVisualColumnNum(sectionId, newVal);
        }}
      >
        <SelectTrigger id={`select-trigger-${sectionId}`}>
          <div
            className="flex items-center gap-1 font-header text-sm hover:text-accent 
            transition-colors duration-200 "
            title="Change Column Number"
          >
            Columns: {visualColumnNum}
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
                      isHighlighted &&
                        n.toString() !== visualColumnNum.toString()
                        ? "font-semibold"
                        : ""
                    )}
                  >
                    {n}
                  </span>
                  {isHighlighted &&
                    n.toString() !== visualColumnNum.toString() && (
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
