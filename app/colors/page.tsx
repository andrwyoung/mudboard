"use client";

import Logo from "@/components/ui/logo";
import { useState, useCallback, useEffect } from "react";

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
import { useColorHistory } from "@/app/colors/lib/hooks/use-color-history";
import { useSimpleImageImport } from "@/app/processing/hooks/use-simple-image-import";
import { DragOverlay } from "@/components/ui/drag-overlay";

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [colorWheelColor, setColorWheelColor] = useState(selectedColor);

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
  const [isEyedropperMode, setIsEyedropperMode] = useState(false);

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

  // Global click handler to cancel eyedropper mode
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (
        isEyedropperMode &&
        !(e.target as HTMLElement).closest("[data-swatch]")
      ) {
        setIsEyedropperMode(false);
      }
    };

    if (isEyedropperMode) {
      document.addEventListener("click", handleGlobalClick);
    }

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [isEyedropperMode]);

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
      <div className="absolute top-4 left-6">
        <Logo color="brown" enforceHome={true} />
      </div>

      <div className="mx-auto flex-1 items-center flex mt-24 mb-16 lg:my-0">
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
              isEyedropperMode={isEyedropperMode}
              setIsEyedropperMode={setIsEyedropperMode}
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

      {/* Mobile-only "Go to Top" button */}
      <ScrollToTop className="lg:hidden" />

      {/* Drag overlay */}
      <DragOverlay dragCount={dragCount} />
    </div>
  );
}
