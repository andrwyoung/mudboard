import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nice Color Picker",
  description:
    "A beautiful and intuitive color picker with support for multiple color formats including HEX, RGB, HSL, HSV, and OKLCH.",
};

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
