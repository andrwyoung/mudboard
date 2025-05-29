import { useLayoutStore } from "@/store/layout-store";
import { useState } from "react";
import { MdSync } from "react-icons/md";
import { toast } from "sonner";

export default function SyncButton() {
  const layoutDirty = useLayoutStore((s) => s.layoutDirty);

  const [isSpinning, setIsSpinning] = useState(false);
  return (
    <div
      className="text-sm flex flex-row gap-1 items-center text-accent
  cursor-pointer w-fit group"
      onClick={async () => {
        if (isSpinning) return; // prevent double tapping

        setIsSpinning(true);
        const success = await useLayoutStore.getState().syncLayout();

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
      />
      <p className="font-semibold ">
        {isSpinning
          ? "Syncing..."
          : layoutDirty
          ? "Unsaved Changes"
          : "Synced!"}
      </p>
    </div>
  );
}
