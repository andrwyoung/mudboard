import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FaSliders } from "react-icons/fa6";
import { CheckField } from "../ui/check-field";
import ColorPickerWheel from "./color-picker/color-picker";
import { useUserPreferenceStore } from "@/store/use-preferences-store";
import {
  DEFAULT_ARRANGE_BG_COLOR,
  DEFAULT_VIEW_BG_COLOR,
} from "@/types/constants";
import { useFreeformStore } from "@/store/freeform-store";
import { getLuminanceFromHex } from "@/lib/color-picker/color-converters";
import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";

type VisiblePicker = "view" | "arrange" | null;

function ColorSettingRow({
  label,
  color,
  defaultColor,
  onChange,
  isEditMode,
  pickerKey,
  visiblePicker,
  setVisiblePicker,
  setEditMode,
}: {
  label: string;
  color: string | null;
  defaultColor: string;
  onChange: (color: string | null) => void;
  isEditMode: boolean;
  pickerKey: "view" | "arrange";
  visiblePicker: VisiblePicker;
  setVisiblePicker: (key: VisiblePicker) => void;
  setEditMode: (b: boolean) => void;
}) {
  const isActive = visiblePicker === pickerKey;
  const displayColor = color ?? defaultColor;
  const textColor =
    getLuminanceFromHex(displayColor) > 0.5 ? "text-stone-800" : "text-white";

  const handleToggle = () => {
    const next = isActive ? null : pickerKey;
    setEditMode(isEditMode);
    setVisiblePicker(next);
  };

  const handleReset = () => {
    onChange(null);
    setVisiblePicker(null);
    setTimeout(() => setVisiblePicker(pickerKey), 0);
    setEditMode(isEditMode);
  };

  return (
    <div>
      <h3 className="text-sm mb-2">{label}</h3>
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-3 py-1 rounded-sm shadow-sm w-20 ring-2 text-xs cursor-pointer ${textColor} ${
            isActive ? "ring-accent" : "ring-transparent"
          }`}
          style={{ backgroundColor: displayColor }}
          onClick={handleToggle}
          aria-label={`Customize ${label.toLowerCase()}`}
          title={`Customize ${label.toLowerCase()}`}
        >
          {displayColor}
        </button>
        {color !== null && (
          <button
            type="button"
            className="text-xs cursor-pointer underline text-muted-foreground/80
          hover:text-primary transition"
            onClick={handleReset}
            aria-label={`Reset ${label.toLowerCase()} to default`}
            title="Reset to default color"
          >
            Default
          </button>
        )}
      </div>
    </div>
  );
}

export default function FreeformPreferenceModal() {
  const showBorder = useUserPreferenceStore((s) => s.minimalBorders);
  const setShowBorder = useUserPreferenceStore((s) => s.setMinimalBorders);
  const viewBgColor = useUserPreferenceStore((s) => s.viewBgColor);
  const setViewBgColor = useUserPreferenceStore((s) => s.setViewBgColor);
  const arrangeBgColor = useUserPreferenceStore((s) => s.arrangeBgColor);
  const setArrangeBgColor = useUserPreferenceStore((s) => s.setArrangeBgColor);

  const setEditMode = useFreeformStore((s) => s.setEditMode);

  const [isOpen, setIsOpen] = useState(false);
  const [visiblePicker, setVisiblePicker] = useState<VisiblePicker>(null);

  const user = useMetadataStore((s) => s.user);

  // updating db
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function queueDbUpdate(delay = 2000) {
    if (!user?.id) {
      console.warn("No user found for preference update.");
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("users")
        .update({
          freeform_border_off: showBorder,
          freeform_view_color: viewBgColor,
          freeform_arrange_color: arrangeBgColor,
        })
        .eq("user_id", user.id);

      if (error) {
        console.warn("Error updating user preferences: ", error);
      }

      console.log("Freeform Preference Synced!");
      timeoutRef.current = null;
    }, delay);
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setVisiblePicker(null);
          }
        }}
      >
        <DialogTrigger title="Canvas Preferences">
          <FaSliders className="size-3.5 text-white cursor-pointer hover:text-accent transition-colors duration-75 translate-y-[1px]" />
        </DialogTrigger>
        <DialogContent className="text-primary select-none ">
          <DialogHeader>
            <DialogTitle className="text-xl">Canvas Preferences</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2">
            <div className="space-y-4 mt-4 mb-6">
              <div className="flex flex-col mb-6">
                <CheckField
                  text="Minimal Border"
                  isChecked={showBorder ?? false}
                  onChange={(border) => {
                    setShowBorder(border);
                    queueDbUpdate();
                  }}
                />
                <p className="ml-2 text-xs">
                  Hide resize border when moving or resizing a single image
                </p>
              </div>

              <ColorSettingRow
                label="Arrange Mode Background"
                color={arrangeBgColor}
                defaultColor={DEFAULT_ARRANGE_BG_COLOR}
                onChange={(color) => {
                  setArrangeBgColor(color);
                  queueDbUpdate();
                }}
                isEditMode={true}
                pickerKey="arrange"
                visiblePicker={visiblePicker}
                setVisiblePicker={setVisiblePicker}
                setEditMode={setEditMode}
              />

              <ColorSettingRow
                label="View Mode Background"
                color={viewBgColor}
                defaultColor={DEFAULT_VIEW_BG_COLOR}
                onChange={(color) => {
                  setViewBgColor(color);
                  queueDbUpdate();
                }}
                isEditMode={false}
                pickerKey="view"
                visiblePicker={visiblePicker}
                setVisiblePicker={setVisiblePicker}
                setEditMode={setEditMode}
              />
            </div>

            <div className="self-center">
              {visiblePicker === "view" && (
                <div className="mt-2">
                  <ColorPickerWheel
                    initialColor={viewBgColor ?? DEFAULT_VIEW_BG_COLOR}
                    onChange={(color) => {
                      setViewBgColor(color);
                      queueDbUpdate();
                    }}
                  />
                </div>
              )}

              {visiblePicker === "arrange" && (
                <div className="mt-2">
                  <ColorPickerWheel
                    initialColor={arrangeBgColor ?? DEFAULT_ARRANGE_BG_COLOR}
                    onChange={(color) => {
                      setArrangeBgColor(color);
                      queueDbUpdate();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
