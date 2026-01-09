import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import React, { useCallback, useEffect, useState } from "react";
import { rgbToHex } from "../../lib/conversions";
import { ColorFormat } from "../../page";
import { ComponentValues } from "../../lib/types/types";
import { toast } from "sonner";
import { DEFAULT_COLOR } from "../../lib/types/color-picker-constants";
import { FaLocationCrosshairs, FaPlay } from "react-icons/fa6";

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
  //

  const handleColorWheelChange = (hex: string) => {
    updateAllFormats({ input: hex, skipColorWheel: true, colorFormat: "hex" });
  };

  // SECTION: Swatches
  //

  const handleSwatchCopyClick = (swatchIndex: number) => {
    const source = swatchColors[swatchIndex];
    setSwatchColors((prev) => {
      const clone = [...prev];
      clone[focusedSwatch] = source;
      return clone;
    });
    updateAllFormats({ input: source, colorFormat: "hex" });
    toast.success(`Copied ${source} → Swatch ${focusedSwatch + 1}`);
  };

  const handleSwatchClick = (swatchIndex: number) => {
    setFocusedSwatch(swatchIndex);
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
            >
              <div
                className={`font-header flex flex-row items-center gap-1 text-xs mb-1 ${
                  focusedSwatch === index ? "font-semibold" : "opacity-60"
                }`}
              >
                {swatch}
                {focusedSwatch !== index && (
                  <FaLocationCrosshairs
                    onClick={() => handleSwatchCopyClick(index)}
                    title="Copy color to focused swatch"
                    className="opacity-60 text-sm hover:text-accent duration-200 cursor-pointer hover:rotate-12"
                  />
                )}
              </div>
              <div
                onClick={() => handleSwatchClick(index)}
                key={index}
                className={`w-22 h-16  ${
                  index === 0
                    ? "rounded-l-lg"
                    : index === swatchColors.length - 1
                    ? "rounded-r-lg"
                    : ""
                } ${focusedSwatch === index ? "" : "cursor-pointer"} ${
                  focusedSwatch === index
                    ? ""
                    : "transition-transform hover:scale-110 hover:z-10"
                }`}
                style={{
                  backgroundColor: swatch,
                }}
                title={`${swatch} - Click to focus`}
              />

              {focusedSwatch === index && (
                // <div className="h-1 w-8 bg-primary mt-2 rounded-full" />
                <FaPlay className="mt-2 -rotate-90" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
