import { useFreeformStore } from "@/store/freeform-store";
import { useUIStore } from "@/store/ui-store";
import { FaTh } from "react-icons/fa";

export function FreeFormToggle() {
  const toggleFreeformMode = useUIStore((s) => s.toggleFreeformMode);
  const freeformMode = useUIStore((s) => s.freeformMode);

  const editMode = useFreeformStore((s) => s.editMode);
  const setEditMode = useFreeformStore((s) => s.setEditMode);

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 
        ${freeformMode ? "text-accent" : "text-white hover:text-accent"}
        `}
      onClick={() => {
        if (editMode) {
          setEditMode(false);
        }
        toggleFreeformMode();
      }}
      title="Toggle Split Screen"
    >
      <FaTh className="" />
      <h3 className={`group-hover:underline `}>Canvas Mode</h3>
    </button>
  );
}
