// DEPRECATED for workspace-toggle.tsx

import { useUIStore } from "@/store/ui-store";
import { FaVectorSquare } from "react-icons/fa6";

export function FreeFormToggle() {
  const toggleFreeformMode = useUIStore((s) => s.toggleFreeformMode);
  const freeformMode = useUIStore((s) => s.freeformMode);

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group px-2 rounded-sm 
         py-0.5 hover:outline hover:outline-accent 
        ${
          freeformMode
            ? "bg-accent text-primary hover:bg-accent/70"
            : "text-primary-text hover:bg-accent/40"
        }
        `}
      onClick={() => {
        toggleFreeformMode();
      }}
      title="Toggle Freeform Mode"
    >
      <FaVectorSquare className="" />
      <h3 className={``}>Freeform</h3>
    </button>
  );
}
