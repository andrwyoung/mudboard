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

export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export interface ComponentValues {
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
}

export interface InputValues {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  oklch: string;
}

export interface InputErrors {
  hex: boolean;
  rgb: boolean;
  hsl: boolean;
  hsv: boolean;
}
