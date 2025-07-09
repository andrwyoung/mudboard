import { useFreeformStore } from "@/store/freeform-store";
import React from "react";
import { FiSidebar } from "react-icons/fi";

export default function FreeformEditToggle() {
  const setEditMode = useFreeformStore((s) => s.setEditMode);
  const editMode = useFreeformStore((s) => s.editMode);

  return (
    <button
      type="button"
      className="flex items-center gap-1 cursor-pointer group"
      onClick={() => setEditMode(!editMode)}
    >
      <FiSidebar className="text-accent" />
      <h3
        className={`transition-all duration-300 group-hover:underline ${
          editMode ? "text-accent" : "text-white group-hover:text-accent"
        }`}
        title="Toggle Split Screen"
      >
        Split Screen
      </h3>
    </button>
  );
}
