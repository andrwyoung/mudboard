import "./globals.css";
import { Recursive, Gantari, Overpass_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

const headerFont = Recursive({
  variable: "--font-header",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const bodyFont = Gantari({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const monoFont = Overpass_Mono({
  variable: "--font-mono",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mudboard",
  description: "Moodboard Creator and Organizer for Professional Artists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headerFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
