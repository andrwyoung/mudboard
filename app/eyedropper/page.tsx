"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsv" | "oklch";
import {
  parseColor,
  formatRgb,
  formatHsl,
  formatHsv,
  formatOklch,
  hexToOklch,
  hexToRgb,
  rgbToHsl,
  rgbToHsv,
  getInitialValues,
} from "./lib/conversions";
import { ComponentValues, InputValues, InputErrors } from "./lib/types/types";
import ColorWheelSection from "./components/sections/color-wheel-section";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { DEFAULT_COLOR } from "./lib/types/color-picker-constants";
import ColorInputSection from "./components/sections/color-input-section";
import { DragOverlay } from "@/components/ui/drag-overlay";
import { Navbar } from "@/components/ui/navbar";
import { useImageStore } from "@/store/home-page/image-store";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { useColorHistory } from "./lib/hooks/use-color-history";
import { useSimpleImageImport } from "../compressor/hooks/use-simple-image-import";

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [colorWheelColor, setColorWheelColor] = useState(selectedColor);

  const images = useImageStore((s) => s.images);

  // Use color history hook
  const { updateColorHistory } = useColorHistory();

  // Add drag and drop functionality
  const { dragCount } = useSimpleImageImport();

  const [inputValues, setInputValues] = useState<InputValues>(
    getInitialValues(DEFAULT_COLOR)
  );
  const [inputErrors, setInputErrors] = useState<InputErrors>({
    hex: false,
    rgb: false,
    hsl: false,
    hsv: false,
  });
  const [masterInput, setMasterInput] = useState<ColorFormat>("hex");

  // Individual component values for sliders
  const [componentValues, setComponentValues] = useState<ComponentValues>(
    () => {
      const rgb = hexToRgb(DEFAULT_COLOR);
      return {
        rgb,
        hsl: rgbToHsl(rgb),
        hsv: rgbToHsv(rgb),
      };
    }
  );

  const updateAllFormats = useCallback(
    ({
      input,
      colorFormat,
      skipMaster = false,
      skipColorWheel = false,
    }: {
      input: string;
      colorFormat?: ColorFormat; // not because parseColor does it already
      skipMaster?: boolean;
      skipColorWheel?: boolean;
    }) => {
      const parsed = parseColor(input, colorFormat || "hex");
      if (parsed) {
        setSelectedColor(parsed.hex);

        if (!skipColorWheel) {
          setColorWheelColor(parsed.hex);
        }

        // Update all inputs except the master input
        const newValues = {
          hex: parsed.hex,
          rgb: formatRgb(parsed.rgb),
          hsl: formatHsl(parsed.hsl),
          hsv: formatHsv(parsed.hsv),
          oklch: formatOklch(hexToOklch(parsed.hex)),
        };

        if (skipMaster && masterInput) {
          // Keep the master input's current value
          setInputValues((prev) => ({
            ...newValues,
            [masterInput]: prev[masterInput],
          }));
        } else {
          setInputValues(newValues);
        }

        setInputErrors({
          hex: false,
          rgb: false,
          hsl: false,
          hsv: false,
        });

        // Update component values for sliders
        setComponentValues({
          rgb: parsed.rgb,
          hsl: parsed.hsl,
          hsv: parsed.hsv,
        });

        // Add to history with debounce
        updateColorHistory(parsed.hex);
      }
    },
    [masterInput, updateColorHistory]
  );

  return (
    <div className="min-h-screen bg-canvas-background-light text-primary relative flex flex-col">
      <Navbar color="brown" />

      <div className="flex-1 mx-auto mt-24 mb-16 lg:my-0 flex flex-col justify-center">
        <div className=" items-center flex ">
          {/* Header */}
          {/* <div className="text-center mb-12">
          <h1 className="text-4xl font-bold ">Nice Color Picker</h1>
        </div> */}

          <div className="max-w-4xl mx-auto  grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-6 my-auto">
            {/* Color Picker */}
            <div className="order-2 lg:order-1">
              <ColorWheelSection
                colorWheelColor={colorWheelColor}
                componentValues={componentValues}
                updateAllFormats={updateAllFormats}
              />
            </div>

            {/* Color Information */}
            <div className="px-8 order-1 lg:order-2">
              <ColorInputSection
                inputValues={inputValues}
                setInputValues={setInputValues}
                inputErrors={inputErrors}
                setInputErrors={setInputErrors}
                masterInput={masterInput}
                setMasterInput={setMasterInput}
                componentValues={componentValues}
                setComponentValues={setComponentValues}
                updateAllFormats={updateAllFormats}
              />
            </div>
          </div>
        </div>

        {images.length !== 0 && (
          <div
            className={`bg-canvas-background-light-secondary max-w-4xl rounded-md mt-12 p-2
               `}
          >
            <div
              className={`flex flex-row gap-2 p-1 overflow-x-auto  ${SCROLLBAR_STYLE}`}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className="shrink-0 border-4 border-transparent rounded-md 
                  overflow-clip hover:border-accent 
                  cursor-pointer duration-200 "
                  title="Eyedrop Image"
                >
                  <Image
                    src={image.preview}
                    alt={image.originalFile.name}
                    width={image.width}
                    height={image.height}
                    className="w-24 h-24 object-cover hover:scale-105 duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-only "Go to Top" button */}
      <ScrollToTop className="lg:hidden" />

      {/* Drag overlay */}
      <DragOverlay dragCount={dragCount} />
    </div>
  );
}
