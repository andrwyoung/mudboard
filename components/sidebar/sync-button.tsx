// this is the little sync button thing
// most of the logic here is just so that it spins and looks cool

import { useFreeformStore } from "@/store/freeform-store";
import { useLayoutStore } from "@/store/layout-store";
import { ACCESSIBLE_BUTTON } from "@/types/constants";
import { useState } from "react";
import { MdSync } from "react-icons/md";
import { toast } from "sonner";

export default function SyncButton() {
  const isAnyGridLayoutDirty = useLayoutStore((s) => s.isAnyLayoutDirty());
  const isAnyFreeformLayoutDirty = useFreeformStore((s) =>
    s.isAnyFreeformDirty()
  );
  const anythingDirty = isAnyFreeformLayoutDirty || isAnyGridLayoutDirty;

  const [isSpinning, setIsSpinning] = useState(false);
  return (
    <button
      type="button"
      aria-label="Sync layout"
      title="Sync layout"
      className={`text-sm flex flex-row gap-1 items-center text-accent
        cursor-pointer w-fit group ${ACCESSIBLE_BUTTON}`}
      onClick={async () => {
        if (isSpinning) return; // prevent double tapping

        setIsSpinning(true);
        const layoutSuccess = await useLayoutStore.getState().syncLayout();
        const freeformSuccess = await useFreeformStore
          .getState()
          .syncFreeform();

        const success = layoutSuccess && freeformSuccess;

        setTimeout(() => {
          setIsSpinning(false);

          if (success) toast.success("Successfully synced!");
          else toast.error("Failed to sync.");
        }, 1600); // matches animation duration
      }}
    >
      <MdSync
        className={`h-4.5 w-4.5 group-hover:scale-105 font-semibold
    ${isSpinning ? "animate-spin-twice" : "group-hover:rotate-12"}`}
        aria-hidden="true"
      />
      <p className="font-semibold font-header">
        {isSpinning
          ? "Syncing..."
          : anythingDirty
          ? "Unsaved Changes"
          : "Synced!"}
      </p>
    </button>
  );
}
