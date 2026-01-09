// Gradient generation utilities for color sliders

import { hsvToRgb } from "./conversions";
import { RGB, HSL, HSV } from "./types/types";

// Generate gradient for RGB sliders
export const getRgbGradient = (
  component: "r" | "g" | "b",
  rgb: RGB
): string => {
  if (component === "r") {
    return `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`;
  } else if (component === "g") {
    return `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`;
  } else {
    return `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`;
  }
};

// Generate gradient for HSL sliders
export const getHslGradient = (
  component: "h" | "s" | "l",
  hsl: HSL
): string => {
  if (component === "h") {
    // Full hue spectrum with multiple color stops
    return `linear-gradient(to right, 
      hsl(0, ${hsl.s}%, ${hsl.l}%), 
      hsl(60, ${hsl.s}%, ${hsl.l}%), 
      hsl(120, ${hsl.s}%, ${hsl.l}%), 
      hsl(180, ${hsl.s}%, ${hsl.l}%), 
      hsl(240, ${hsl.s}%, ${hsl.l}%), 
      hsl(300, ${hsl.s}%, ${hsl.l}%), 
      hsl(360, ${hsl.s}%, ${hsl.l}%))`;
  } else if (component === "s") {
    return `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`;
  } else {
    return `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 100%))`;
  }
};

// Generate gradient for HSV sliders
export const getHsvGradient = (
  component: "h" | "s" | "v",
  hsv: HSV
): string => {
  if (component === "h") {
    // Convert HSV to RGB for proper color display
    const rgb0 = hsvToRgb({ h: 0, s: hsv.s, v: hsv.v });
    const rgb60 = hsvToRgb({ h: 60, s: hsv.s, v: hsv.v });
    const rgb120 = hsvToRgb({ h: 120, s: hsv.s, v: hsv.v });
    const rgb180 = hsvToRgb({ h: 180, s: hsv.s, v: hsv.v });
    const rgb240 = hsvToRgb({ h: 240, s: hsv.s, v: hsv.v });
    const rgb300 = hsvToRgb({ h: 300, s: hsv.s, v: hsv.v });
    const rgb360 = hsvToRgb({ h: 360, s: hsv.s, v: hsv.v });

    return `linear-gradient(to right, 
      rgb(${rgb0.r}, ${rgb0.g}, ${rgb0.b}),
      rgb(${rgb60.r}, ${rgb60.g}, ${rgb60.b}),
      rgb(${rgb120.r}, ${rgb120.g}, ${rgb120.b}),
      rgb(${rgb180.r}, ${rgb180.g}, ${rgb180.b}),
      rgb(${rgb240.r}, ${rgb240.g}, ${rgb240.b}),
      rgb(${rgb300.r}, ${rgb300.g}, ${rgb300.b}),
      rgb(${rgb360.r}, ${rgb360.g}, ${rgb360.b}))`;
  }

  if (component === "s") {
    // LEFT = white/gray (s=0), RIGHT = pure hue (s=100)
    const rgbLow = hsvToRgb({ h: hsv.h, s: 0, v: hsv.v });
    const rgbHigh = hsvToRgb({ h: hsv.h, s: 100, v: hsv.v });
    return `linear-gradient(to right,
      rgb(${rgbLow.r}, ${rgbLow.g}, ${rgbLow.b}),
      rgb(${rgbHigh.r}, ${rgbHigh.g}, ${rgbHigh.b})
    )`;
  }

  // V slider: BLACK → hue at full V
  const rgbLow = hsvToRgb({ h: hsv.h, s: hsv.s, v: 0 });
  const rgbMid = hsvToRgb({ h: hsv.h, s: hsv.s, v: 50 });
  const rgbHigh = hsvToRgb({ h: hsv.h, s: hsv.s, v: 100 });
  return `linear-gradient(to right,
    rgb(${rgbLow.r}, ${rgbLow.g}, ${rgbLow.b}),
    rgb(${rgbMid.r}, ${rgbMid.g}, ${rgbMid.b}),
    rgb(${rgbHigh.r}, ${rgbHigh.g}, ${rgbHigh.b})
  )`;
};
