// NOT USED

import { usePanelStore } from "@/store/panel-store";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SpotlightToggle() {
  const pinnedBlock = usePanelStore((s) => s.pinnedBlock);

  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);

  const isOpen = panelMode === "focus";

  return (
    <div className="w-full flex justify-center mt-1">
      <div
        className={`flex gap-2 flex-row items-center outline-1 rounded-lg px-3 py-1
          hover:outline-accent cursor-pointer
          ${pinnedBlock ? "outline-accent" : "outline-transparent"}
          ${
            isOpen
              ? "bg-accent text-primary hover:bg-accent/70"
              : "text-off-white hover:bg-accent/40"
          }`}
        onClick={() => {
          if (isOpen) {
            setPanelMode("none");
          } else {
            setPanelMode("focus");
          }
        }}
      >
        <FaMagnifyingGlass className="size-4" />
        <h1 className={`text-sm font-semibold`}>Spotlight</h1>
      </div>
    </div>
  );
}
