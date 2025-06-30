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

export default function Home() {
  const user = useMetadataStore((s) => s.user);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-full bg-primary">
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
          src="/hero3.png"
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-10 sm:leading-14 md:leading-18 max-w-4xl">
                {/* Draw more. Organize less. */}
                {/* Stay in touch with your inspiration. */}
                References that remember.
                {/* Revisit what inspired you. */}
                {/* Remember what inspired you. */}
              </h1>
              <div className="flex flex-col items-center">
                <p className="max-w-lg text-xs sm:text-sm text-accent font-bold">
                  Early testing • Come try it!
                </p>
                {/* <p className="text-lg mb-14 w-full font-semibold">
                  For illustrators who’d rather draw than organize reference
                  images
                </p> */}
                {/* <p className="text-lg mb-14 w-full font-semibold max-w-xl">
                  A workspace for illustrators to organize and reuse reference
                  images. So you're ready to ignite inspiration when it matters.
                </p> */}
                <p className="text-sm sm:text-lg mb-14 w-full font-semibold max-w-xl">
                  A workspace to organize and reuse your favorite images. So you
                  always find what you saved for a reason.
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
                  href={NEW_BOARD_LINK}
                  className="font-header font-semibold hover:underline hover:text-accent 
                cursor-pointer select-none transition-all duration-300 text-sm"
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

          {/* FEATURES */}
          <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12 mb-32 text-left">
            <Features />
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

          <Testimonials />

          <ComparisonTable />

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
            {/* <p className="text-center mb-8 text-sm">
              Pricing isn&apos;t final yet, but here&apos;s the ballpark
              estimate for what I&apos;ll launch with. Later I was probably
              gonna do a $6-7 tier with more limited features and a $12-15 tier.
              Really, the reason I charge is to protect me from storage costs.
            </p> */}
            <p className="text-center text-sm text-muted mb-6 font-semibold">
              Firsts 300 users get the Lifetime license for <strong>$20</strong>{" "}
              .
            </p>
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
              Bring your favorite references into your workflow.
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
