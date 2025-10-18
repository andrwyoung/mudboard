// Gradient generation utilities for color sliders
import { RGB, HSL, HSV } from "./conversions";

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
    return `linear-gradient(to right, hsl(0, ${hsl.s}%, ${hsl.l}%), hsl(360, ${hsl.s}%, ${hsl.l}%))`;
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
    return `linear-gradient(to right, hsl(0, ${hsv.s}%, ${hsv.v}%), hsl(360, ${hsv.s}%, ${hsv.v}%))`;
  } else if (component === "s") {
    return `linear-gradient(to right, hsl(${hsv.h}, 0%, ${hsv.v}%), hsl(${hsv.h}, 100%, ${hsv.v}%))`;
  } else {
    return `linear-gradient(to right, hsl(${hsv.h}, ${hsv.s}%, 0%), hsl(${hsv.h}, ${hsv.s}%, 100%))`;
  }
};
