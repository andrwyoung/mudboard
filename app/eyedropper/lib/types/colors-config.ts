// Unified configuration for color formats
export const colorFormatConfig = {
  hex: {
    label: "HEX",
    placeholder: "#000000",
    sliders: null, // HEX doesn't have sliders
  },
  rgb: {
    label: "RGB",
    placeholder: "rgb(0, 0, 0)",
    sliders: [
      { label: "R", component: "r", min: 0, max: 255, unit: "" },
      { label: "G", component: "g", min: 0, max: 255, unit: "" },
      { label: "B", component: "b", min: 0, max: 255, unit: "" },
    ],
  },
  hsl: {
    label: "HSL",
    placeholder: "hsl(0, 0%, 0%)",
    sliders: [
      { label: "H", component: "h", min: 0, max: 360, unit: "°" },
      { label: "S", component: "s", min: 0, max: 100, unit: "%" },
      { label: "L", component: "l", min: 0, max: 100, unit: "%" },
    ],
  },
  hsv: {
    label: "HSV",
    placeholder: "hsv(0, 0%, 0%)",
    sliders: [
      { label: "H", component: "h", min: 0, max: 360, unit: "°" },
      { label: "S", component: "s", min: 0, max: 100, unit: "%" },
      { label: "V", component: "v", min: 0, max: 100, unit: "%" },
    ],
  },
  oklch: {
    label: "OKLCH",
    placeholder: "oklch(70% 0.15 180deg)",
    sliders: null, // OKLCH is read-only, no sliders
    readonly: true, // Mark as read-only
  },
};
