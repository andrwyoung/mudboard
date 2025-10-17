"use client";

import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import Logo from "@/components/ui/logo";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  parseColor,
  formatRgb,
  formatHsl,
  formatHsv,
  hexToRgb,
  rgbToHsl,
  rgbToHsv,
  hslToRgb,
  hsvToRgb,
} from "./conversions";
import { FaCopy, FaHashtag } from "react-icons/fa";
import { toast } from "sonner";
import ColorSlider from "./components/ColorSlider";

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
    [colorHistory, masterInput, updateColorHistory]
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

  const handleInputBlur = () => {
    setMasterInput("hex");
    lastClickedInputRef.current = null; // Reset click tracking
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
                  initialColor={selectedColor}
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
                {[
                  { key: "hex", label: "HEX", placeholder: "#000000" },
                  { key: "rgb", label: "RGB", placeholder: "rgb(0, 0, 0)" },
                  { key: "hsl", label: "HSL", placeholder: "hsl(0, 0%, 0%)" },
                  { key: "hsv", label: "HSV", placeholder: "hsv(0, 0%, 0%)" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {label}
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
                        onBlur={handleInputBlur}
                        onClick={handleInputClick}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          handleInputChange(
                            key as "hex" | "rgb" | "hsl" | "hsv",
                            pastedText
                          );
                        }}
                        className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border rounded-md 
                            font-mono text-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent ${
                              key === "hex" ? "pr-20" : "pr-10"
                            } ${
                          inputErrors[key as keyof typeof inputErrors]
                            ? "border-red-500 focus:ring-red-500"
                            : masterInput === key
                            ? "border-blue-500 focus:ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                        }`}
                        placeholder={placeholder}
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
                          key === "hex" ? "Copy HEX without #" : `Copy ${label}`
                        }
                      >
                        <FaCopy className="w-5 h-5 " />
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
                    {key !== "hex" && (
                      <div className="mt-3 space-y-2">
                        {key === "rgb" && (
                          <>
                            <ColorSlider
                              label="R"
                              min={0}
                              max={255}
                              value={componentValues.rgb.r}
                              onChange={(value) =>
                                handleSliderChange("rgb", "r", value)
                              }
                              isActive={masterInput === "rgb"}
                            />
                            <ColorSlider
                              label="G"
                              min={0}
                              max={255}
                              value={componentValues.rgb.g}
                              onChange={(value) =>
                                handleSliderChange("rgb", "g", value)
                              }
                              isActive={masterInput === "rgb"}
                            />
                            <ColorSlider
                              label="B"
                              min={0}
                              max={255}
                              value={componentValues.rgb.b}
                              onChange={(value) =>
                                handleSliderChange("rgb", "b", value)
                              }
                              isActive={masterInput === "rgb"}
                            />
                          </>
                        )}

                        {key === "hsl" && (
                          <>
                            <ColorSlider
                              label="H"
                              min={0}
                              max={360}
                              value={componentValues.hsl.h}
                              onChange={(value) =>
                                handleSliderChange("hsl", "h", value)
                              }
                              unit="°"
                              isActive={masterInput === "hsl"}
                            />
                            <ColorSlider
                              label="S"
                              min={0}
                              max={100}
                              value={componentValues.hsl.s}
                              onChange={(value) =>
                                handleSliderChange("hsl", "s", value)
                              }
                              unit="%"
                              isActive={masterInput === "hsl"}
                            />
                            <ColorSlider
                              label="L"
                              min={0}
                              max={100}
                              value={componentValues.hsl.l}
                              onChange={(value) =>
                                handleSliderChange("hsl", "l", value)
                              }
                              unit="%"
                              isActive={masterInput === "hsl"}
                            />
                          </>
                        )}

                        {key === "hsv" && (
                          <>
                            <ColorSlider
                              label="H"
                              min={0}
                              max={360}
                              value={componentValues.hsv.h}
                              onChange={(value) =>
                                handleSliderChange("hsv", "h", value)
                              }
                              unit="°"
                              isActive={masterInput === "hsv"}
                            />
                            <ColorSlider
                              label="S"
                              min={0}
                              max={100}
                              value={componentValues.hsv.s}
                              onChange={(value) =>
                                handleSliderChange("hsv", "s", value)
                              }
                              unit="%"
                              isActive={masterInput === "hsv"}
                            />
                            <ColorSlider
                              label="V"
                              min={0}
                              max={100}
                              value={componentValues.hsv.v}
                              onChange={(value) =>
                                handleSliderChange("hsv", "v", value)
                              }
                              unit="%"
                              isActive={masterInput === "hsv"}
                            />
                          </>
                        )}
                      </div>
                    )}
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
