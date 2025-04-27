import React from "react";
import { Barlow, Gantari, Overpass_Mono } from "next/font/google";

const barlow = Barlow({
  variable: "--font-header-barlow",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const gantari = Gantari({
  variable: "--font-body-gantari",
  subsets: ["latin"],
});

const overpassMono = Overpass_Mono({
  variable: "--font-overpass-mono",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const FontWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <body
      className={`${barlow.variable} ${gantari.variable} ${overpassMono.variable} antialiased`}
    >
      {children}
    </body>
  );
};
