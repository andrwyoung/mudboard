import "./globals.css";
import { Recursive, Gantari, Overpass_Mono, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import LoginDetector from "./login-detector";

const headerFont = Recursive({
  variable: "--font-header",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const bodyFont2 = Gantari({
  variable: "--font-body-secondary",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const bodyFont = Figtree({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const monoFont = Overpass_Mono({
  variable: "--font-mono",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Mudboard",
    default: "Mudboard",
  },

  description:
    "Personal reference board and image processing tools made for illustrators and professional artists.",

  // Optional but helpful:
  metadataBase: new URL("https://mudboard.com"),

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
    description: "Tools to organize and process reference images for artists.",
    url: "https://mudboard.com",
    siteName: "Mudboard",
    images: [
      {
        url: "/metadata/og-image.png",
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
    description: "Tools to organize and process reference images for artists.",
    images: ["/metadata/og-image.png"],
    creator: "@andrwyoung1",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/metadata/apple-touch-icon.png",
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
      <head>
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
      </head>
      <body
        className={`${headerFont.variable} ${bodyFont.variable} ${bodyFont2.variable} ${monoFont.variable} antialiased`}
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
