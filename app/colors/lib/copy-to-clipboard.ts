import { toast } from "sonner";
import { ColorFormat } from "../page";
import { rgbToHex, formatRgb, formatHsl, formatHsv } from "./conversions";
import { ComponentValues, InputValues, InputErrors } from "./types/types";

interface CopyToClipboardParams {
  format: ColorFormat;
  pure?: boolean;
  componentValues: ComponentValues;
  inputValues: Pick<InputValues, "oklch">;
  inputErrors: InputErrors;
}

export const copyToClipboard = async ({
  format,
  pure = false,
  componentValues,
  inputValues,
  inputErrors,
}: CopyToClipboardParams) => {
  let value = "";

  switch (format) {
    case "hex":
      if (inputErrors.hex) {
        toast.error("Invalid HEX code");
        return;
      }

      if (pure) {
        // Use the actual hex value from componentValues to ensure it has #
        const hexValue = rgbToHex(componentValues.rgb);
        value = hexValue.replace("#", "");
      } else {
        // Use the actual hex value from componentValues
        value = rgbToHex(componentValues.rgb);
      }
      break;
    case "rgb":
      if (inputErrors.rgb) {
        toast.error("Invalid RGB code");
        return;
      }

      if (pure) {
        value = `${componentValues.rgb.r}, ${componentValues.rgb.g}, ${componentValues.rgb.b}`;
      } else {
        value = formatRgb(componentValues.rgb);
      }
      break;
    case "hsl":
      if (inputErrors.hsl) {
        toast.error("Invalid HSL code");
        return;
      }

      if (pure) {
        value = `${componentValues.hsl.h}, ${componentValues.hsl.s}, ${componentValues.hsl.l}`;
      } else {
        value = formatHsl(componentValues.hsl);
      }
      break;
    case "hsv":
      if (inputErrors.hsv) {
        toast.error("Invalid HSV code");
        return;
      }

      if (pure) {
        value = `${componentValues.hsv.h}, ${componentValues.hsv.s}, ${componentValues.hsv.v}`;
      } else {
        value = formatHsv(componentValues.hsv);
      }
      break;
    case "oklch":
      value = inputValues.oklch;
      break;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Copied "${value}" to clipboard`);
  } catch (err) {
    console.error("Failed to copy color:", err);
  }
};
