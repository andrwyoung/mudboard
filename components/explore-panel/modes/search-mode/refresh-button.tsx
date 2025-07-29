// this is the little sync button thing
// most of the logic here is just so that it spins and looks cool

import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { ACCESSIBLE_BUTTON } from "@/types/constants";
import { useState } from "react";
import { MdSync } from "react-icons/md";
import { toast } from "sonner";

export default function RefreshButton() {
  const fetchMudkits = useExploreStore((s) => s.fetchMudkits);
  const user = useMetadataStore((s) => s.user);

  const handleClick = () => {
    if (isSpinning) return; // prevent double tapping
    setIsSpinning(true);

    fetchMudkits(user?.id);

    setTimeout(() => {
      setIsSpinning(false);

      toast.success("Successfully refreshed Sections!");
    }, 1600); // matches animation duration
  };

  const [isSpinning, setIsSpinning] = useState(false);
  return (
    <button
      type="button"
      aria-label="Refresh all Sections"
      title="Refresh all Sections"
      onClick={handleClick}
      className={`text-xs flex flex-row gap-0.5 items-center hover:text-accent 
        hover:underline cursor-pointer ${ACCESSIBLE_BUTTON}`}
    >
      <MdSync
        className={`h-3.5 w-3.5 group-hover:scale-105 font-semibold
            ${isSpinning ? "animate-spin-twice" : "group-hover:rotate-12"}`}
        aria-hidden="true"
      />
      Refresh
    </button>
  );
}
