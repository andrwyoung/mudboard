import { useUIStore } from "@/store/ui-store";
import { FaVectorSquare } from "react-icons/fa6";

export function FreeFormToggle() {
  const toggleFreeformMode = useUIStore((s) => s.toggleFreeformMode);
  const freeformMode = useUIStore((s) => s.freeformMode);

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group px-2 rounded-sm 
         py-0.5
        ${
          freeformMode
            ? "bg-accent text-primary"
            : "text-white hover:text-accent"
        }
        `}
      onClick={() => {
        toggleFreeformMode();
      }}
      title="Toggle Freeform Mode"
    >
      <FaVectorSquare className="" />
      <h3 className={`group-hover:underline `}>Canvas Mode</h3>
    </button>
  );
}
