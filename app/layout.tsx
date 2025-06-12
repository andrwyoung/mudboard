import "./globals.css";
import { Recursive, Gantari, Overpass_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import LoginDetector from "./login-detector";

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
  description:
    "A reference board made for Illustrators and Professional Artists. Spend more time drawing, not organizing photos",

  // Optional but helpful:
  metadataBase: new URL("https://mudboard.com"), // your real domain

  alternates: {
    canonical: "https://mudboard.com",
  },
  keywords: [
    "reference board for artists",
    "visual library for drawing",
    "illustration reference tool",
    "drawing moodboard",
    "art reference organizer",
    "mudboard",
    "artist tool for references",
    "drawing photo board",
  ],

  openGraph: {
    title: "Mudboard",
    description:
      "Ref board for illustrators. Spend more time drawing, not organizing.",
    url: "https://mudboard.com",
    siteName: "Mudboard",
    images: [
      {
        url: "https://mudboard.com/og-image.png", // replace with your image URL
        width: 1200,
        height: 630,
        alt: "Screenshot of Mudboard Landing Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mudboard",
    description:
      "Ref board for illustrators. Spend more time drawing, not organizing.",
    images: ["https://mudboard.com/og-image.png"],
    creator: "@andrwyoung1",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  category: "design",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#7F6464",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="8282ef7d-266d-4d26-80b8-81730d6c330d"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Mudboard",
              url: "https://mudboard.com",
              applicationCategory: "DesignApplication",
              description:
                "A reference board made for illustrators. Spend more time drawing, not organizing photos.",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "5.00",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>
      <body
        className={`${headerFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
      >
        <LoginDetector />
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
