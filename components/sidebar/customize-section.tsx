// this component is everything inside the "change look" dropdown
// (or whatever I ended up to naming it....)
// it's the "mirror mode" button and the slider to change column number

// I really do need to come up with a better name for it

import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS } from "@/types/constants";
import { CheckField } from "../ui/check-field";
import { changeBoardPermissions } from "@/lib/db-actions/change-board-permissions";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export default function CustomizeSection() {
  const setNumCols = useUIStore((s) => s.setNumCols);
  const numCols = useUIStore((s) => s.numCols);

  const board = useMetadataStore((s) => s.board);
  const canEdit = canEditBoard();
  const openToPublic = board?.access_level === "public";

  const boardUnclaimed = board !== null && board.user_id === null;

  return (
    <div className=" flex flex-col gap-4 ">
      <div className="flex flex-col gap-1 self-center w-full">
        {canEdit && !boardUnclaimed && (
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

        <h3 className="text-xs font-semibold px-4">Columns:</h3>

        <div>
          <div className="flex justify-center py-1">
            {Array.from({ length: MAX_COLUMNS }, (_, i) => {
              const col = i + 1;
              const isActive = numCols > col;
              const isPicked = numCols === col;

              return (
                <button
                  key={col}
                  className={`flex flex-col group cursor-pointer px-[3px]`}
                  onClick={() => {
                    setNumCols(col);
                  }}
                  aria-label={`Set columns to ${col}`}
                  title={`Set columns to ${col}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 
                      ${
                        isPicked
                          ? "scale-110 bg-accent border-accent"
                          : isActive
                          ? "border-primary bg-accent group-hover:border-accent"
                          : "bg-white group-hover:bg-accent border-primary "
                      } `}
                  />
                  {isPicked && (
                    <p className="font-header text-xs font-bold mt-1">
                      {i + 1}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
