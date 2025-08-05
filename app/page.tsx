// landing page

"use client";

import Logo from "@/components/ui/logo";
import { useEffect, useState } from "react";
import PricingTable from "@/components/landing-page/pricing-v2";
import Features from "@/components/landing-page/features";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";
import {
  DASHBOARD_LINK,
  DEMO_BOARD_LINK,
  INTEREST_LINK,
  LOGIN_LINK,
  NEW_BOARD_LINK,
} from "@/types/constants";
import Link from "next/link";
import { useMetadataStore } from "@/store/metadata-store";
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

export default function Home() {
  const user = useMetadataStore((s) => s.user);

  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-full bg-primary">
      {marqueRect && <MarqueBox marqueRect={marqueRect} />}

      <div
        className={`z-12 flex flex-row justify-between px-8 py-4 fixed top-0 w-screen h-16 transition-colors duration-500 ${
          scrolled ? "bg-primary/95 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <Logo enforceHome={true} />
        <div className="flex gap-3">
          {!user ? (
            <Link
              href={LOGIN_LINK}
              className={`flex gap-2  cursor-pointer items-center px-3 border-2 border-white justify-center
                rounded-md text-white text-sm font-header transition-all duration-500
                hover:text-white hover:bg-white/30 
                `}
              data-umami-event={`Landing page: Login`}
            >
              Log In
            </Link>
          ) : (
            <Link
              href={DASHBOARD_LINK}
              data-umami-event={`Landing page: Dashboard`}
              className={`flex gap-2  cursor-pointer items-center px-3 border-2 border-white justify-center
                rounded-md text-white text-sm font-header transition-all duration-500
                hover:text-white hover:bg-white/30 
                `}
            >
              Dashboard
            </Link>
          )}
          <Link
            href={DEMO_BOARD_LINK}
            data-umami-event={`Landing page: Demo Board Navbar`}
            className={`hidden sm:flex gap-2  cursor-pointer items-center px-3 border-2 border-accent bg-accent justify-center
                rounded-md text-primary text-lg font-header transition-all duration-500
                hover:text-white hover:bg-accent/90 
                `}
          >
            Demo
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden z-0">
        <Image
          src="/hero4.png"
          alt="Gallery of images"
          fill
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary via-primary/90 via-30% to-transparent to-90% z-10 pointer-events-none" />
      </div>

      <div className=" flex flex-col items-center">
        <div
          className="z-10 w-full max-w-screen mx-auto px-6 text-primary-text 
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
                    : "text-white"
                }`}
              >
                {/* Draw more. Organize less. */}
                Organize Your References.
                {/* Create More. Organize Less. */}
                {/* Build Moodboards Fast. */}
                {/* Get Ideas Out Fast. */}
                {/* Draw more. Rebuild less. */}
                {/* References that remember. */}
              </h1>
              <div className="flex flex-col items-center">
                <p className="max-w-lg text-xs sm:text-sm text-accent font-bold">
                  Early Testing • Come Check it Out!
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
                  className={`text-sm sm:text-lg mb-14 w-full font-semibold max-w-xl 
                    transition-colors duration-200 ${
                      highlightedIndexes.includes("subheader")
                        ? "text-accent"
                        : "text-white"
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
                  For illustators that want to use references fast, and
                  don&apos;t like digging through dozens of folders to find
                  something.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center justify-center gap-2">
                <Link
                  href={DEMO_BOARD_LINK}
                  title="Demo board link"
                  className="flex flex-col px-6 py-2 bg-accent justify-center
                rounded-md text-primary text-xl font-header transition-all duration-300
                hover:text-white hover:bg-accent/90"
                  data-umami-event={`Landing page: Demo Board CTA`}
                >
                  <div className="flex gap-2 items-center">
                    <FaPlay className="size-4 translate-y-[1px]" />
                    <h1>Try Demo Board</h1>
                  </div>
                  <p className="text-xs font-semibold -translate-y-[2px]">
                    (No Signup Required)
                  </p>
                </Link>

                <Link
                  data-id="new_board"
                  data-marque-track
                  href={NEW_BOARD_LINK}
                  className={`font-header font-semibold hover:underline hover:text-accent 
                cursor-pointer select-none transition-all duration-300 text-sm
                ${
                  highlightedIndexes.includes("new_board")
                    ? "text-accent"
                    : "text-white"
                }`}
                  data-umami-event={`Landing page: Blank Board`}
                  title="New board link"
                >
                  Or Start a Blank Board
                </Link>
              </div>

              {SHOW_GLOBAL_ANNOUNCEMENT && (
                <div className="p-2 rounded-lg mt-12  max-w-sm mx-auto border-2 border-yellow-300 bg-primary/80">
                  <div className="text-xs text-white text-center ">
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

          {/* <div className="flex flex-col items-center gap-2 mb-32">
            <h1 className="font-semibold text-lg">A Mudboard in the wild</h1>
            <div className="max-w-4xl rounded-lg overflow-hidden border-3 border-secondary">
              <Image
                src={"/screeny3.png"}
                alt={"Mudboard Screenshot"}
                width={1685}
                height={943}
              />
            </div>
          </div> */}

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
                src="/section_002.webp"
                alt="Grid Export Example"
                width={1600}
                height={1529}
                className=""
              />
            </div>
            <div className="flex flex-col items-center">
              <h1 className="font-semibold ">Freeform Layout</h1>
              <Image
                src="/section_001.webp"
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

          <div className="mb-24 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-1">Pricing</h2>

            <p className="text-center text-sm text-muted mb-6 font-semibold">
              Giving out Lifetime Licenses during Early Testing (planned until
              late September)!
            </p>
            {/* <p className="text-center text-sm text-muted mb-6 font-semibold">
              We&apos;re still testing, so pricing isn&apos;t implemented yet.
              But you can join the waitlist to stay updated!
            </p> */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left mb-2"> */}
            <div>
              <PricingTable />
            </div>
            {/* <p className="text-center text-sm font-semibold">
              *Boards currently have a limit of around 1k images
            </p> */}
          </div>

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
              hover:bg-accent/90 hover:text-white transition-all duration-300"
              >
                Try Demo Board
              </Link>
              <p className="font-regular text-sm">- or -</p>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={INTEREST_LINK}
                className="text-sm font-header hover:underline text-white hover:text-accent"
                title="Mudboard interest form"
              >
                Follow along for the journey
              </Link>
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
    </div>
  );
}
