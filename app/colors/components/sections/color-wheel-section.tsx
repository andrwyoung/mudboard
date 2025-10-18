import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import React, { useCallback, useEffect, useState } from "react";
import { FaEyeDropper } from "react-icons/fa";
import { rgbToHex } from "../../lib/conversions";
import { DEFAULT_COLOR, ColorFormat } from "../../page";
import { ComponentValues } from "../../lib/types/types";

interface ColorWheelSectionProps {
  colorWheelColor: string;
  componentValues: ComponentValues;
  updateAllFormats: (params: {
    input: string;
    colorFormat: ColorFormat;
    skipMaster?: boolean;
    skipColorWheel?: boolean;
  }) => void;
}

export default function ColorWheelSection({
  colorWheelColor,
  componentValues,
  updateAllFormats,
}: ColorWheelSectionProps) {
  const [swatchColors, setSwatchColors] = useState([
    "#50f280",
    DEFAULT_COLOR,
    "#3ccf8e",
  ]);
  const [focusedSwatch, setFocusedSwatch] = useState(1);

  // SECTION: Color Wheel
  const handleColorWheelChange = (hex: string) => {
    updateAllFormats({ input: hex, skipColorWheel: true, colorFormat: "hex" });
  };

  // SECTION: Swatches
  //

  // Handle swatch click - switch focus and update all values
  const handleSwatchClick = (swatchIndex: number) => {
    setFocusedSwatch(swatchIndex);

    // Update all values to match the clicked swatch
    const hex = swatchColors[swatchIndex];
    updateAllFormats({ input: hex, colorFormat: "hex" });
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
    <div className="flex flex-col items-center justify-center ">
      <ColorPickerWheel
        color={colorWheelColor}
        onChange={handleColorWheelChange}
        size={320}
        pickerSize={20}
        hueHeight={36}
        selectorBorderSize={4}
      />
      <div className="mt-6 flex gap-8">
        <div className="flex ">
          {swatchColors.map((swatch, index) => (
            <div
              className="flex flex-col items-center "
              key={`swatch-${index}`}
            >
              <div
                key={index}
                className={`w-20 h-16 cursor-pointer duration-300  transition-transform hover:scale-110 hover:z-10 ${
                  index === 0
                    ? "rounded-l-lg"
                    : index === swatchColors.length - 1
                    ? "rounded-r-lg"
                    : ""
                } ${focusedSwatch === index ? "" : ""}`}
                style={{
                  backgroundColor: swatch,
                }}
                title={`${swatch} - Click to focus`}
                onClick={() => handleSwatchClick(index)}
              />
              <div className="h-10">
                {focusedSwatch === index && (
                  <div className="h-2 w-8 bg-white mt-2 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <FaEyeDropper />
        </div>
      </div>
    </div>
  );
}
