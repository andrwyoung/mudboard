"use client";

import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import Logo from "@/components/ui/logo";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  parseColor,
  formatRgb,
  formatHsl,
  formatHsv,
  hslToRgb,
  hsvToRgb,
} from "./lib/conversions";
import { FaCopy, FaHashtag } from "react-icons/fa";
import { toast } from "sonner";
import ColorSlider from "./components/color-slider";
import { colorFormatConfig } from "./lib/colors-config";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_COLOR = "#3b82f6";
const COLOR_DEBOUNCE_TIME = 500;
const MAX_HISTORY = 20;

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [colorHistory, setColorHistory] = useState<string[]>([DEFAULT_COLOR]);
  const [inputValues, setInputValues] = useState({
    hex: DEFAULT_COLOR,
    rgb: "rgb(59, 130, 246)",
    hsl: "hsl(213, 91%, 60%)",
    hsv: "hsv(213, 76%, 96%)",
  });
  const [inputErrors, setInputErrors] = useState({
    hex: false,
    rgb: false,
    hsl: false,
    hsv: false,
  });
  const [masterInput, setMasterInput] = useState<"hex" | "rgb" | "hsl" | "hsv">(
    "hex"
  );

  // Individual component values for sliders
  const [componentValues, setComponentValues] = useState({
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 213, s: 91, l: 60 },
    hsv: { h: 213, s: 76, v: 96 },
  });

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
    (hex: string, skipMaster: boolean = false) => {
      const parsed = parseColor(hex);
      if (parsed) {
        setSelectedColor(hex);

        // Update all inputs except the master input
        const newValues = {
          hex: parsed.hex,
          rgb: formatRgb(parsed.rgb),
          hsl: formatHsl(parsed.hsl),
          hsv: formatHsv(parsed.hsv),
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

        setInputErrors({ hex: false, rgb: false, hsl: false, hsv: false });

        // Update component values for sliders
        setComponentValues({
          rgb: parsed.rgb,
          hsl: parsed.hsl,
          hsv: parsed.hsv,
        });

        // Add to history with debounce
        updateColorHistory(hex);
      }
    },
    [masterInput, updateColorHistory]
  );

  const handleColorChange = (color: string) => {
    updateAllFormats(color);
  };

  const handleInputChange = (
    format: "hex" | "rgb" | "hsl" | "hsv",
    value: string
  ) => {
    setInputValues((prev) => ({ ...prev, [format]: value }));

    const parsed = parseColor(value);
    if (parsed) {
      // If this is the master input, update others but don't update this one
      if (masterInput === format) {
        updateAllFormats(parsed.hex, true);
      } else {
        // If this is not the master input, only update if master is "hex" (default)
        if (masterInput === "hex") {
          updateAllFormats(parsed.hex);
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

  const handleInputFocus = (format: "hex" | "rgb" | "hsl" | "hsv") => {
    setMasterInput(format);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied, "${value}" to clipboard`);
    } catch (err) {
      console.error("Failed to copy color:", err);
    }
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

    // Convert to hex and update all formats
    let hex: string;
    if (format === "rgb") {
      const rgb = newComponents as { r: number; g: number; b: number };
      hex = `#${Math.round(rgb.r).toString(16).padStart(2, "0")}${Math.round(
        rgb.g
      )
        .toString(16)
        .padStart(2, "0")}${Math.round(rgb.b).toString(16).padStart(2, "0")}`;
    } else if (format === "hsl") {
      const hsl = newComponents as { h: number; s: number; l: number };
      const rgb = hslToRgb(hsl);
      hex = `#${Math.round(rgb.r).toString(16).padStart(2, "0")}${Math.round(
        rgb.g
      )
        .toString(16)
        .padStart(2, "0")}${Math.round(rgb.b).toString(16).padStart(2, "0")}`;
    } else {
      // hsv
      const hsv = newComponents as { h: number; s: number; v: number };
      const rgb = hsvToRgb(hsv);
      hex = `#${Math.round(rgb.r).toString(16).padStart(2, "0")}${Math.round(
        rgb.g
      )
        .toString(16)
        .padStart(2, "0")}${Math.round(rgb.b).toString(16).padStart(2, "0")}`;
    }

    updateAllFormats(hex);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 left-6">
        <Logo color="brown" />
      </div>

      <div className="container mx-auto px-4 py-8 mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Color Picker
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Picker */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Color Wheel
              </h2>
              <div className="flex justify-center">
                <ColorPickerWheel
                  color={selectedColor}
                  onChange={handleColorChange}
                  size={320}
                  pickerSize={16}
                  hueHeight={32}
                />
              </div>
            </div>

            {/* Color Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Color Information
              </h2>

              {/* Color Formats */}
              <div className="space-y-3">
                {Object.entries(colorFormatConfig).map(([key, config]) => (
                  <div key={key} className={`${key === "hex" ? "mb-8" : ""}`}>
                    <label
                      className={`block font-medium text-slate-700 dark:text-slate-300 mb-1 ${
                        key === "hex" ? "text-lg font-semibold" : "text-sm"
                      }`}
                    >
                      {config.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValues[key as keyof typeof inputValues]}
                        onChange={(e) =>
                          handleInputChange(
                            key as "hex" | "rgb" | "hsl" | "hsv",
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          handleInputFocus(key as "hex" | "rgb" | "hsl" | "hsv")
                        }
                        onClick={handleInputClick}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          handleInputChange(
                            key as "hex" | "rgb" | "hsl" | "hsv",
                            pastedText
                          );
                        }}
                        className={`w-full justify-center px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 rounded-md 
                            font-header text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:border-transparent ${
                              key === "hex"
                                ? "pr-20 text-2xl py-3 font-semibold"
                                : "pr-10 text-sm py-1.5"
                            } ${
                          inputErrors[key as keyof typeof inputErrors]
                            ? "border-red-500 focus:ring-red-500"
                            : masterInput === key
                            ? "border-secondary focus:ring-secondary bg-card-foreground dark:bg-blue-900/20"
                            : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                        }`}
                        placeholder={config.placeholder}
                      />

                      {/* Copy button for all formats */}
                      <button
                        onClick={() =>
                          copyToClipboard(
                            key === "hex"
                              ? inputValues.hex.replace("#", "")
                              : inputValues[key as keyof typeof inputValues]
                          )
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
                      {key === "hex" && (
                        <button
                          onClick={() => copyToClipboard(inputValues.hex)}
                          className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1
                          cursor-pointer hover:bg-slate-100 rounded transition-colors duration-200 hover:text-accent text-dark-text"
                          title="Copy HEX with #"
                        >
                          <FaHashtag className="w-5 h-5 " />
                        </button>
                      )}
                    </div>

                    {/* Sliders for RGB, HSL, HSV */}
                    <AnimatePresence initial={false}>
                      {key !== "hex" &&
                        masterInput === key &&
                        config.sliders && (
                          <motion.div
                            key={key} // required for AnimatePresence to isolate blocks
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-2 mt-4 mb-2">
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

          {/* Color History */}
          {colorHistory.length > 1 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Recent Colors
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {colorHistory.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => updateAllFormats(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color
                        ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
