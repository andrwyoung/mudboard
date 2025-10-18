// Color conversion utilities
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

// Parse different color formats
export function parseColor(
  input: string
): { hex: string; rgb: RGB; hsl: HSL; hsv: HSV } | null {
  const trimmed = input.trim();

  // Try HEX first
  if (trimmed.startsWith("#")) {
    const hex = parseHex(trimmed);
    if (hex) {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb);
      const hsv = rgbToHsv(rgb);
      return { hex, rgb, hsl, hsv };
    }
  }

  // Try RGB
  const rgbMatch = trimmed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (rgbMatch) {
    const rgb = {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    return { hex, rgb, hsl, hsv };
  }

  // Try HSL
  const hslMatch = trimmed.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
  if (hslMatch) {
    const hsl = {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
    };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    const hsv = rgbToHsv(rgb);
    return { hex, rgb, hsl, hsv };
  }

  // Try HSV
  const hsvMatch = trimmed.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
  if (hsvMatch) {
    const hsv = {
      h: parseInt(hsvMatch[1]),
      s: parseInt(hsvMatch[2]),
      v: parseInt(hsvMatch[3]),
    };
    const rgb = hsvToRgb(hsv);
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    return { hex, rgb, hsl, hsv };
  }

  return null;
}

// HEX parsing and validation
export function parseHex(hex: string): string | null {
  const cleaned = hex.replace("#", "");

  // Handle 3-digit hex
  if (cleaned.length === 3) {
    const expanded = cleaned
      .split("")
      .map((char) => char + char)
      .join("");
    return `#${expanded}`;
  }

  // Handle 6-digit hex
  if (cleaned.length === 6 && /^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }

  return null;
}

// RGB to HEX
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// HEX to RGB
export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substr(0, 2), 16);
  const g = parseInt(cleaned.substr(2, 2), 16);
  const b = parseInt(cleaned.substr(4, 2), 16);
  return { r, g, b };
}

// RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// HSL to RGB
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// RGB to HSV
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// HSV to RGB
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 1 / 6) [r, g, b] = [c, x, 0];
  else if (1 / 6 <= h && h < 2 / 6) [r, g, b] = [x, c, 0];
  else if (2 / 6 <= h && h < 3 / 6) [r, g, b] = [0, c, x];
  else if (3 / 6 <= h && h < 4 / 6) [r, g, b] = [0, x, c];
  else if (4 / 6 <= h && h < 5 / 6) [r, g, b] = [x, 0, c];
  else if (5 / 6 <= h && h < 1) [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Format functions for display
export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function formatHsv(hsv: HSV): string {
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}
