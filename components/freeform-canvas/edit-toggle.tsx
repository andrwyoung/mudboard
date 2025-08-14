import { useFreeformStore } from "@/store/freeform-store";
import React from "react";
import { FaArrowPointer } from "react-icons/fa6";

export function FreeformEditToggle() {
  const setEditMode = useFreeformStore((s) => s.setEditMode);
  const editMode = useFreeformStore((s) => s.editMode);

  return (
    <button
      type="button"
      className={`flex items-center gap-1 cursor-pointer group transition-all duration-300
        ${editMode ? "text-accent" : "text-primary-text hover:text-accent/80"}`}
      onClick={() => setEditMode(!editMode)}
    >
      <FaArrowPointer className="" />
      <h3 className={` group-hover:underline `} title="Toggle Rearrange Mode">
        Rearrange (E)
      </h3>
    </button>
  );
}

const sliderClass =
  "text-sm font-header px-2 py-1 cursor-pointer hover:bg-accent/60 text-primary rounded-md w-full";

export function FreeformEditToggleSlider() {
  const editMode = useFreeformStore((s) => s.editMode);
  const setEditMode = useFreeformStore((s) => s.setEditMode);

  return (
    <div
      className="flex flex-col items-center gap-1 p-1 bg-primary-foreground rounded-sm"
      role="group"
      aria-label="Toggle between view and arrange mode"
    >
      <button
        type="button"
        aria-pressed={editMode}
        aria-label="Switch to arrange mode"
        title="Arrange mode (E)"
        onClick={() => {
          if (!editMode) setEditMode(true);
        }}
        className={`${sliderClass} ${editMode ? "bg-accent" : ""}`}
      >
        Arrange
      </button>

      <button
        type="button"
        aria-pressed={!editMode}
        aria-label="Switch to view mode"
        title="View mode (E)"
        onClick={() => {
          if (editMode) setEditMode(false);
        }}
        className={`${sliderClass} ${!editMode ? "bg-accent" : ""}`}
      >
        View
      </button>
    </div>
  );
}
