// landing page

"use client";

import { useState } from "react";
import Features from "@/components/landing-page/features";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";
import { DEMO_BOARD_LINK } from "@/types/constants";
import Link from "next/link";
import {
  GlobalAnnouncement,
  SHOW_GLOBAL_ANNOUNCEMENT,
} from "@/types/constants/error-message";
import FAQ from "@/components/landing-page/faq";
import ComparisonTable from "@/components/landing-page/comparison";
import LandingPageDemo from "@/components/landing-page/tools-demo";
import Testimonials from "@/components/landing-page/testimonials";
import { MarqueBox } from "@/components/board/marque";
import { useTextMarque } from "@/hooks/gallery/use-landing-marque";
import { DragOverlay } from "@/components/ui/drag-overlay";
import { Navbar } from "@/components/ui/navbar";
import { useSimpleImageImport } from "./compressor/hooks/use-simple-image-import";

export default function Home() {
  const [marqueRect, setMarqueRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const { highlightedIndexes } = useTextMarque({
    setMarqueRect,
    getMarqueTargets: () =>
      Array.from(document.querySelectorAll("[data-marque-track]")),
  });

  // Add drag and drop functionality
  const { dragCount } = useSimpleImageImport();

  return (
    <div className="w-full h-full bg-primary">
      {marqueRect && <MarqueBox marqueRect={marqueRect} />}

      <Navbar enforceHome={true} />

      <div className="absolute inset-0 overflow-hidden z-0">
        <Image
          src="/landing/hero.png"
          alt="Gallery of images"
          fill
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-linear-to-t from-primary via-primary/90 via-30% to-transparent to-90% z-10 pointer-events-none" />
      </div>

      <div className=" flex flex-col items-center">
        <div
          className="z-10 w-full max-w-screen mx-auto px-6 text-off-white 
          flex flex-col items-center"
        >
          {/* HERO */}

          <div className="flex flex-col items-center justify-center min-h-[90vh] pt-[25vh] sm:pt-[25vh] text-center">
            <div
              className=" self-center w-full text-center
            rounded-lg p-2 mb-48"
            >
              <h1
                data-id="hero"
                data-marque-track
                className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-10
                   sm:leading-14 md:leading-18 max-w-4xl transition-colors duration-200
                ${
                  highlightedIndexes.includes("hero")
                    ? "text-accent"
                    : "text-off-white"
                }`}
              >
                {/* Draw more. Organize less. */}
                {/* Organize Your References. */}
                Tools for Artists
                {/* Create More. Organize Less. */}
                {/* Build Moodboards Fast. */}
                {/* Get Ideas Out Fast. */}
                {/* Draw more. Rebuild less. */}
                {/* References that remember. */}
              </h1>
              <div className="flex flex-col items-center">
                <p className="max-w-lg text-xs sm:text-sm text-accent font-bold">
                  Everything&apos;s Free • Come Check it Out!
                </p>
                {/* <p className="text-lg mb-14 w-full font-semibold">
                  For illustrators who’d rather draw than organize reference
                  images
                </p> */}
                {/* <p className="text-lg mb-14 w-full font-semibold max-w-xl">
                  A workspace for illustrators to organize and reuse reference
                  images. So you're ready to ignite inspiration when it matters.
                </p> */}
                {/* <p className="text-lg mb-14 w-full font-semibold max-w-xl">
                  For illustrators that gather references that they never look
                  at again.
                </p> */}
                {/* <p className="text-lg mb-14 w-full font-semibold max-w-xl">
                  A workspace to organize and reuse your favorite images. So you
                  always find what you saved for a reason.
                </p> */}
                {/* <p className="text-lg mb-14 w-full font-semibold max-w-xl">
                  For illustrators who <strong>lose hours</strong> building
                  reference boards — and even more{" "}
                  <strong>digging through folders</strong> for images they
                  already saved.
                </p> */}
                <p
                  data-id="subheader"
                  data-marque-track
                  className={`text-sm sm:text-lg mb-14 w-full font-body-secondary font-semibold max-w-xl 
                    transition-colors duration-200 ${
                      highlightedIndexes.includes("subheader")
                        ? "text-accent"
                        : "text-off-white"
                    }`}
                >
                  {/* A fast moodboarding tool for designers who want to test and
                  export ideas fast — and are tired of spending hours aligning
                  images. */}
                  {/* A fast moodboarding tool for creatives who want to test ideas
                  fast and export it cleanly. Without clutter or folder chaos. */}
                  {/* An image organization tool for creatives who want to build
                  moodboards fast and export it cleanly. */}
                  {/* For creatives that want to organize images and ideas without
                  losing creative momentum — then share them cleanly. */}
                  {/* Built for creatives who need to test ideas quickly, export
                  cleanly, and never rebuild the same board twice. */}
                  {/* For illustators that want to organize and use references
                  without digging through dozens of folders to find something. */}
                  {/* For illustators that want to use references fast, and
                  don&apos;t like digging through dozens of folders to find
                  something. */}
                  A place for illustrators to process and manage all your photos
                  quickly. Whether just to eyedrop an image or manage your
                  reference library.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center justify-center gap-2">
                <Link
                  href={DEMO_BOARD_LINK}
                  title="Demo board link"
                  className="flex flex-col px-6 py-2 bg-accent justify-center
                rounded-md text-primary text-xl font-header transition-all duration-300
                hover:text-off-white hover:bg-accent/90"
                  data-umami-event={`Landing page: Demo Board CTA`}
                >
                  <div className="flex gap-2 items-center">
                    <FaPlay className="size-4 translate-y-px" />
                    <h1>Try Demo Board</h1>
                  </div>
                  <p className="text-xs font-semibold -translate-y-[2px]">
                    (No Signup Required)
                  </p>
                </Link>

                {/* <Link
                  data-id="new_board"
                  data-marque-track
                  href={NEW_BOARD_LINK}
                  className={`font-header font-semibold hover:underline hover:text-accent 
                cursor-pointer select-none transition-all duration-300 text-sm
                ${
                  highlightedIndexes.includes("new_board")
                    ? "text-accent"
                    : "text-off-white"
                }`}
                  data-umami-event={`Landing page: Blank Board`}
                  title="New board link"
                >
                  Or Start a Blank Board
                </Link> */}

                <a
                  data-id="new_board"
                  data-marque-track
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.jonadrew.com/"
                  className={`font-header font-semibold hover:underline hover:text-accent 
                cursor-pointer select-none transition-all duration-300 text-sm
                ${
                  highlightedIndexes.includes("new_board")
                    ? "text-accent"
                    : "text-off-white"
                }`}
                  data-umami-event={`Landing page: Art Portfolio`}
                  title="Andrew's Art Portfolio"
                >
                  Or View Andrew&apos;s Portfolio Board
                </a>
              </div>

              {SHOW_GLOBAL_ANNOUNCEMENT && (
                <div className="p-2 rounded-lg mt-12  max-w-sm mx-auto border-2 border-yellow-300 bg-primary/80">
                  <div className="text-xs text-off-white text-center ">
                    {GlobalAnnouncement}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="flex flex-col mb-16 items-center mt-4">
            <h1 className=" text-xl md:text-3xl font-bold mb-2">
              What is Mudboard?
            </h1>
    
            <p className="text-sm md:text-[0.9375rem] leading-relaxed max-w-xl text-center">
              Mudboard is a fast, visual workspace for illustrators to{" "}
              <strong>build and export reference boards</strong> - without
              setup, clutter or wasted time.
            </p>
          </div> */}

          {/* FEATURES */}
          <div className="max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-12 mb-36 text-left">
            <Features highlightedIndexes={highlightedIndexes} />
          </div>

          <LandingPageDemo />
          <ComparisonTable />

          <h1 className="text-2xl font-semibold">Exports in the Wild</h1>
          <p className="mb-6 text-sm">
            Export your sections to share ideas with friends or clients!
          </p>
          <div className="flex flex-col  gap-20  max-w-3xl items-center mb-32 w-full">
            <div className="flex flex-col items-center">
              <h1 className="font-semibold mb-4">Grid Layout </h1>
              <Image
                src="/landing/export-grid.webp"
                alt="Grid Export Example"
                width={1600}
                height={1529}
                className=""
              />
            </div>
            <div className="flex flex-col items-center">
              <h1 className="font-semibold ">Freeform Layout</h1>
              <Image
                src="/landing/export-freeform.webp"
                alt="Freeform Export Example"
                width={1600}
                height={1025}
                className=""
              />
            </div>
          </div>

          <Testimonials />

          <Image
            id="pricing"
            src="/1white.png"
            alt="Board not found"
            width={375}
            height={150}
            className="mb-4"
          />

          {/* PRICING */}

          {/* <div className="mb-24 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-1">Pricing</h2>

            <p className="text-center text-sm text-muted mb-6 font-semibold">
              Giving out Lifetime Licenses during Early Testing (planned until
              late September)!
            </p>

            <div>
              <PricingTable />
            </div>
          </div> */}

          <FAQ />

          <section className="w-full text-center mb-24 px-6 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold max-w-xl mb-2">
              Find and use your References.
            </h2>
            <p className="text-sm font-medium mb-6">
              Try the demo board! No signup required.
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <Link
                href={DEMO_BOARD_LINK}
                title="Demo board link"
                className="px-6 py-2 bg-accent text-primary text-lg rounded-md font-header
              hover:bg-accent/90 hover:text-off-white transition-all duration-300"
              >
                Try Demo Board
              </Link>
              {/* <p className="font-regular text-sm">- or -</p>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={INTEREST_LINK}
                className="text-sm font-header hover:underline text-off-white hover:text-accent"
                title="Mudboard interest form"
              >
                Follow along for the journey
              </Link> */}
            </div>
          </section>

          <Image
            src="/2white.png"
            alt="Board not found"
            width={375}
            height={150}
          />
        </div>

        {/* FOOTER */}
        <footer className="mb-8">
          <a
            href="https://www.andrwyoung.com/"
            className="font-mono tracking-tightest text-xs font-semibold
            hover:underline"
            title="Andrew's website"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built by Andrew Yong
          </a>
        </footer>
      </div>

      {/* Drag overlay */}
      <DragOverlay dragCount={dragCount} />
    </div>
  );
}
