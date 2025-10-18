import {
  getLuminanceFromHSV,
  hexToHSV,
  hsvToHex,
} from "@/lib/color-picker/color-converters";
import React, { useState, useEffect } from "react";

const DEFAULT_COLOR_PICKER_SIZE = 144;
const DEFAULT_HUE_HEIGHT = 16;
const DEFAULT_PICKER_SIZE = 12;
const DEFAULT_BORDER_SIZE = 3;

export default function ColorPickerWheel({
  color,
  onChange,

  size = DEFAULT_COLOR_PICKER_SIZE,
  hueHeight = DEFAULT_HUE_HEIGHT,
  pickerSize = DEFAULT_PICKER_SIZE,
  selectorBorderSize = DEFAULT_BORDER_SIZE,
}: {
  color: string;
  onChange: (color: string) => void;

  size?: number;
  hueHeight?: number;
  pickerSize?: number;
  selectorBorderSize?: number;
}) {
  const [hsv, setHSV] = useState(() => hexToHSV(color));
  const isColorLight = getLuminanceFromHSV(hsv) > 0.5;

  // Sync with external color changes (backwards compatibility)
  useEffect(() => {
    const newHSV = hexToHSV(color);
    setHSV(newHSV);
  }, [color]);

  const handleSVMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();

    const update = (clientX: number, clientY: number) => {
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const newHSV = { ...hsv, s: x * 100, v: (1 - y) * 100 };
      setHSV(newHSV);
      onChange(hsvToHex(newHSV));
    };

    update(e.clientX, e.clientY);

    let frame: number | null = null;
    const move = (moveEvent: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        update(moveEvent.clientX, moveEvent.clientY)
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();

    const updateHue = (clientX: number) => {
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newHSV = { ...hsv, h: x * 360 };
      setHSV(newHSV);
      onChange(hsvToHex(newHSV));
    };

    updateHue(e.clientX);

    let frame: number | null = null;
    const move = (moveEvent: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => updateHue(moveEvent.clientX));
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="flex flex-col items-center rounded-md">
      <div
        className="relative rounded-t-sm overflow-hidden shadow-lg cursor-pointer "
        style={{ width: size, height: size }}
        onMouseDown={handleSVMouseDown}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `hsl(${hsv.h}, 100%, 50%)`,
            maskImage: `linear-gradient(to right, black, white)`,
            WebkitMaskImage: `linear-gradient(to right, black, white)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, black, transparent), linear-gradient(to left, transparent, white)",
          }}
        />
        <div
          className={`absolute rounded-full shadow-lg ${
            isColorLight ? "border-stone-800" : "border-white"
          }`}
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            transform: "translate(-50%, -50%)",
            width: pickerSize,
            height: pickerSize,
            borderWidth: selectorBorderSize,
          }}
        />
      </div>

      <div
        className="relative rounded-b-sm overflow-hidden shadow-inner cursor-pointer"
        style={{ width: size, height: hueHeight }}
        onMouseDown={handleHueMouseDown}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
        <div
          className={`absolute top-1/2 h-8 
            ${
              hsv.h >= 20 && hsv.h <= 140
                ? "bg-slate-500"
                : "bg-primary-foreground"
            }`}
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            transform: "translate(-50%, -50%)",
            height: hueHeight,
            width: selectorBorderSize + 1,
          }}
        />
      </div>
    </div>
  );
}
