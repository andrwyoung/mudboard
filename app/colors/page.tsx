"use client";

import Logo from "@/components/ui/logo";
import { useState, useCallback, useRef, useEffect } from "react";

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
import { copyToClipboard } from "./lib/copy-to-clipboard";
import { ComponentValues, InputValues, InputErrors } from "./lib/types/types";
import ColorSlider from "./components/color-slider";
import { colorFormatConfig } from "./lib/types/colors-config";
import {
  getRgbGradient,
  getHslGradient,
  getHsvGradient,
} from "./lib/gradients";
import { AnimatePresence, motion } from "framer-motion";
import { FaCopy, FaEyeDropper, FaHashtag } from "react-icons/fa6";
import ColorWheelSection from "./components/sections/color-wheel-section";

export const DEFAULT_COLOR = "#4cde7e";
const COLOR_DEBOUNCE_TIME = 500;
const MAX_HISTORY = 20;

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [colorWheelColor, setColorWheelColor] = useState(selectedColor);
  const [colorHistory, setColorHistory] = useState<string[]>([]);

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

  // Debounced history update
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateColorHistory = useCallback(
    (hex: string) => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }

      historyTimeoutRef.current = setTimeout(() => {
        if (!colorHistory.includes(hex)) {
          setColorHistory((prev) => [hex, ...prev.slice(0, MAX_HISTORY - 1)]);
        }
      }, COLOR_DEBOUNCE_TIME);
    },
    [colorHistory]
  );

  // clear on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  const updateAllFormats = useCallback(
    ({
      input,
      colorFormat,
      skipMaster = false,
      skipColorWheel = false,
    }: {
      input: string;
      colorFormat: ColorFormat; // not because parseColor does it already
      skipMaster?: boolean;
      skipColorWheel?: boolean;
    }) => {
      const parsed = parseColor(input, colorFormat);
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

  const handleInputChange = (format: ColorFormat, value: string) => {
    // OKLCH is read-only, don't allow changes
    if (format === "oklch") {
      return;
    }

    setInputValues((prev) => ({ ...prev, [format]: value }));

    const parsed = parseColor(value, format);
    if (parsed) {
      // If this is the master input, update others but don't update this one
      if (masterInput === format) {
        updateAllFormats({
          input: value,
          colorFormat: format,
          skipMaster: true,
        });
      } else {
        // If this is not the master input, only update if master is "hex" (default)
        if (masterInput === "hex") {
          updateAllFormats({ input: value, colorFormat: format });
        }
      }
    } else if (value.trim() === "") {
      // Clear error if input is empty
      setInputErrors((prev) => ({ ...prev, [format]: false }));
    } else {
      // Mark this input as having an error
      setInputErrors((prev) => ({ ...prev, [format]: true }));
    }
  };

  // Track which input was last clicked to prevent aggressive selection
  const lastClickedInputRef = useRef<HTMLInputElement | null>(null);
  // Track if a slider interaction is happening to prevent blur from resetting masterInput
  const sliderInteractionRef = useRef<boolean>(false);

  // Refs for each input to enable selection after copy
  const inputRefs = useRef<{
    hex: HTMLInputElement | null;
    rgb: HTMLInputElement | null;
    hsl: HTMLInputElement | null;
    hsv: HTMLInputElement | null;
    oklch: HTMLInputElement | null;
  }>({
    hex: null,
    rgb: null,
    hsl: null,
    hsv: null,
    oklch: null,
  });

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;

    // If this is the same input that was clicked before, don't select all
    if (lastClickedInputRef.current === target) {
      return; // Allow normal cursor positioning
    }

    // Store reference to the element before setTimeout
    lastClickedInputRef.current = target;
    // Use setTimeout to ensure the focus event has been processed
    setTimeout(() => {
      target.select();
    }, 0);
  };

  const handleInputFocus = (format: ColorFormat) => {
    // OKLCH is read-only, don't set as master input
    if (format !== "oklch") {
      setMasterInput(format);
    }
  };

  const handleInputBlur = () => {
    lastClickedInputRef.current = null;
  };

  // Slider handlers for individual components
  const handleSliderChange = (
    format: "rgb" | "hsl" | "hsv",
    component: string,
    value: number
  ) => {
    // Mark that a slider interaction is happening
    sliderInteractionRef.current = true;
    // Set this format as the master input when using sliders
    setMasterInput(format);

    const newComponents = {
      ...componentValues[format],
      [component]: value,
    };

    setComponentValues((prev) => ({
      ...prev,
      [format]: newComponents,
    }));

    // Convert to formatted string and update all formats
    let formattedInput: string;
    if (format === "rgb") {
      const rgb = newComponents as { r: number; g: number; b: number };
      formattedInput = formatRgb(rgb);
    } else if (format === "hsl") {
      const hsl = newComponents as { h: number; s: number; l: number };
      formattedInput = formatHsl(hsl);
    } else {
      // hsv
      const hsv = newComponents as { h: number; s: number; v: number };
      formattedInput = formatHsv(hsv);
    }

    updateAllFormats({ input: formattedInput, colorFormat: format });
  };

  return (
    <div className="min-h-screen bg-canvas-background-light text-primary relative pb-24">
      <div className="absolute top-4 left-6">
        <Logo color="brown" />
      </div>

      <div className="container mx-auto px-4 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold ">Nice Color Picker</h1>
        </div>

        <div className="max-w-4xl mx-auto mb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
          {/* Color Picker */}
          <ColorWheelSection
            colorWheelColor={colorWheelColor}
            componentValues={componentValues}
            updateAllFormats={updateAllFormats}
          />

          {/* Color Information */}
          <div className="px-8">
            {/* Color Formats */}
            <div className="space-y-3">
              {Object.entries(colorFormatConfig).map(([key, config]) => (
                <div
                  key={key}
                  className={`${
                    key === "hex" ? "mb-12" : "flex flex-col self-end"
                  }`}
                >
                  <div
                    className={`${
                      key === "hex" ? "" : "flex items-center gap-4"
                    }`}
                  >
                    <label
                      className={`block font-header font-medium w-10  dark:text-slate-300 mb-1 ${
                        key === "hex" ? "text-lg font-semibold" : "text-sm"
                      }`}
                    >
                      {config.label}:
                    </label>

                    <div className="relative w-full">
                      <input
                        ref={(el) => {
                          inputRefs.current[
                            key as keyof typeof inputRefs.current
                          ] = el;
                        }}
                        type="text"
                        value={inputValues[key as keyof typeof inputValues]}
                        maxLength={key === "hex" ? 7 : undefined}
                        readOnly={key === "oklch"}
                        tabIndex={key === "oklch" ? -1 : 0}
                        onChange={(e) =>
                          handleInputChange(key as ColorFormat, e.target.value)
                        }
                        onFocus={() => handleInputFocus(key as ColorFormat)}
                        onBlur={handleInputBlur}
                        onClick={key === "oklch" ? undefined : handleInputClick}
                        onPaste={(e) => {
                          // OKLCH is read-only, don't allow paste
                          if (key === "oklch") {
                            e.preventDefault();
                            return;
                          }
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          handleInputChange(key as ColorFormat, pastedText);
                        }}
                        className={`w-full justify-center px-4 py-2 border-2 rounded-md 
                            font-header text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:border-transparent ${
                              key === "hex"
                                ? "pr-20 text-2xl py-3 font-semibold"
                                : "pr-10 text-sm py-1.5"
                            } ${
                          key === "oklch"
                            ? "bg-slate-200 dark:bg-slate-500 cursor-not-allowed opacity-60 pointer-events-none"
                            : key === "hex"
                            ? "bg-slate-50"
                            : "bg-slate-50 opacity-95"
                        } ${
                          inputErrors[key as keyof typeof inputErrors]
                            ? "border-red-500 focus:ring-red-500"
                            : masterInput === key
                            ? "border-primary focus:ring-secondary bg-card-foreground dark:bg-blue-900/20"
                            : "border-stone-500 focus:ring-blue-500"
                        }`}
                        placeholder={config.placeholder}
                      />

                      {/* Copy button for all formats */}
                      <button
                        onClick={() =>
                          copyToClipboard({
                            format: key as ColorFormat,
                            pure: key === "hex",
                            componentValues,
                            inputValues,
                            inputErrors,
                          })
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1
                          cursor-pointer hover:bg-slate-100 rounded transition-colors duration-200 hover:text-accent text-dark-text"
                        title={
                          key === "hex"
                            ? "Copy HEX without #"
                            : `Copy ${config.label}`
                        }
                      >
                        <FaCopy
                          className={` ${
                            key === "hex" ? "w-5 h-5 " : "w-4 h-4"
                          }`}
                        />
                      </button>

                      {/* Additional button for HEX with hashtag */}
                      {key !== "oklch" && (
                        <button
                          onClick={() =>
                            copyToClipboard({
                              format: key as ColorFormat,
                              pure: key !== "hex",
                              componentValues,
                              inputValues,
                              inputErrors,
                            })
                          }
                          className={`absolute top-1/2 transform -translate-y-1/2 p-1
                          cursor-pointer hover:bg-slate-100 rounded transition-colors duration-200 hover:text-accent text-dark-text
                          
                          ${key === "hex" ? "right-9" : "right-8 opacity-80"}`}
                          title={
                            key === "hex"
                              ? "Copy HEX with #"
                              : `Copy ${config.label} as CSV `
                          }
                        >
                          {key === "hex" ? (
                            <FaHashtag className="w-5 h-5 " />
                          ) : (
                            <FaHashtag className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sliders for RGB, HSL, HSV */}
                  <AnimatePresence initial={false}>
                    {key !== "hex" && masterInput === key && config.sliders && (
                      <motion.div
                        key={key} // required for AnimatePresence to isolate blocks
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2 mt-4 mb-2 mx-2">
                          {config.sliders.map((slider) => (
                            <ColorSlider
                              key={slider.component}
                              label={slider.label}
                              min={slider.min}
                              max={slider.max}
                              value={
                                componentValues[
                                  key as keyof typeof componentValues
                                ][
                                  slider.component as keyof (
                                    | typeof componentValues.rgb
                                    | typeof componentValues.hsl
                                    | typeof componentValues.hsv
                                  )
                                ] as number
                              }
                              onChange={(value) =>
                                handleSliderChange(
                                  key as "rgb" | "hsl" | "hsv",
                                  slider.component,
                                  value
                                )
                              }
                              unit={slider.unit}
                              gradient={
                                key === "rgb"
                                  ? getRgbGradient(
                                      slider.component as "r" | "g" | "b",
                                      componentValues.rgb
                                    )
                                  : key === "hsl"
                                  ? getHslGradient(
                                      slider.component as "h" | "s" | "l",
                                      componentValues.hsl
                                    )
                                  : getHsvGradient(
                                      slider.component as "h" | "s" | "v",
                                      componentValues.hsv
                                    )
                              }
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
