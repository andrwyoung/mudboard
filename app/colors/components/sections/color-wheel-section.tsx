import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import React, { useCallback, useEffect, useState } from "react";
import { FaEyeDropper } from "react-icons/fa";
import { rgbToHex } from "../../lib/conversions";
import { ColorFormat } from "../../page";
import { ComponentValues } from "../../lib/types/types";
import { toast } from "sonner";
import { DEFAULT_COLOR } from "../../lib/types/color-picker-constants";

interface ColorWheelSectionProps {
  colorWheelColor: string;
  componentValues: ComponentValues;
  updateAllFormats: (params: {
    input: string;
    colorFormat: ColorFormat;
    skipMaster?: boolean;
    skipColorWheel?: boolean;
  }) => void;
  isEyedropperMode: boolean;
  setIsEyedropperMode: (value: boolean) => void;
}

export default function ColorWheelSection({
  colorWheelColor,
  componentValues,
  updateAllFormats,
  isEyedropperMode,
  setIsEyedropperMode,
}: ColorWheelSectionProps) {
  const [swatchColors, setSwatchColors] = useState([
    "#50f280",
    DEFAULT_COLOR,
    "#3ccf8e",
  ]);
  const [focusedSwatch, setFocusedSwatch] = useState(1);

  // SECTION: Color Wheel
  //

  const handleColorWheelChange = (hex: string) => {
    updateAllFormats({ input: hex, skipColorWheel: true, colorFormat: "hex" });
  };

  // SECTION: Swatches
  //

  const handleSwatchClick = (swatchIndex: number) => {
    if (isEyedropperMode) {
      // Don't do anything if clicking on the already focused swatch
      if (swatchIndex === focusedSwatch) {
        setIsEyedropperMode(false);
        return;
      }

      // Eyedropper mode: copy clicked swatch color to focused swatch
      const sourceColor = swatchColors[swatchIndex];
      setSwatchColors((prev) => {
        const newSwatches = [...prev];
        newSwatches[focusedSwatch] = sourceColor;
        return newSwatches;
      });

      // Update the main color picker to match the copied color
      updateAllFormats({ input: sourceColor, colorFormat: "hex" });

      // Exit eyedropper mode
      setIsEyedropperMode(false);
      toast.success(`Copied ${sourceColor} to Swatch ${focusedSwatch + 1}`);
    } else {
      // Normal mode: switch focus and update all values
      setFocusedSwatch(swatchIndex);
      const hex = swatchColors[swatchIndex];
      updateAllFormats({ input: hex, colorFormat: "hex" });
    }
  };

  // Update the focused swatch when main color changes
  const updateFocusedSwatch = useCallback(() => {
    setSwatchColors((prev) => {
      const newSwatches = [...prev];
      newSwatches[focusedSwatch] = rgbToHex(componentValues.rgb);
      return newSwatches;
    });
  }, [componentValues, focusedSwatch]);

  // Update focused swatch when componentValues change
  useEffect(() => {
    updateFocusedSwatch();
  }, [updateFocusedSwatch]);

  return (
    <div className="flex flex-col px-6 items-center justify-center ">
      <ColorPickerWheel
        color={colorWheelColor}
        onChange={handleColorWheelChange}
        size={320}
        pickerSize={20}
        hueHeight={36}
        selectorBorderSize={4}
      />
      <div className="mt-4 flex gap-4 items-center">
        <div className="flex ">
          {swatchColors.map((swatch, index) => (
            <div
              className="flex flex-col items-center "
              key={`swatch-${index}`}
              onClick={() => handleSwatchClick(index)}
            >
              <div
                className={`font-header  text-xs mb-1 ${
                  focusedSwatch === index ? "font-semibold" : "opacity-60"
                }`}
              >
                {swatch}
              </div>
              <div
                key={index}
                className={`w-20 h-16  ${
                  index === 0
                    ? "rounded-l-lg"
                    : index === swatchColors.length - 1
                    ? "rounded-r-lg"
                    : ""
                } ${
                  focusedSwatch === index
                    ? ""
                    : isEyedropperMode
                    ? "cursor-crosshair"
                    : "cursor-pointer"
                } ${
                  focusedSwatch === index
                    ? ""
                    : "transition-transform hover:scale-110 hover:z-10"
                }`}
                style={{
                  backgroundColor: swatch,
                }}
                title={
                  isEyedropperMode
                    ? `${swatch} - Click to copy to focused swatch`
                    : `${swatch} - Click to focus`
                }
              />
              <div className="h-10">
                {focusedSwatch === index && (
                  <div className="h-1 w-8 bg-primary mt-2 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setIsEyedropperMode(!isEyedropperMode)}
            className={`p-2 rounded-lg transition-all duration-200 cursor-pointer  ${
              isEyedropperMode
                ? "bg-accent text-white shadow-lg hover:bg-accent/60"
                : " text-canvas-background-dark hover:text-accent"
            }`}
            title={
              isEyedropperMode
                ? "Exit eyedropper mode"
                : "Enter eyedropper mode"
            }
          >
            <FaEyeDropper />
          </button>
        </div>
      </div>
    </div>
  );
}
