"use client";

import Logo from "@/components/ui/logo";

import { useEffect, useState } from "react";
import FillingDot from "@/components/ui/filling-dot";
import PricingTable from "@/components/landing-page/pricing";
import Features from "@/components/landing-page/features";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";

function FAQItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-2 border-border rounded-md py-2 px-4 group transition-all text-left cursor-pointer"
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="w-full flex gap-4 items-center justify-between transition-colors hover:text-accent">
        <h3 className="text-lg font-semibold select-none">{question}</h3>
        {/* <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        /> */}
        <FillingDot selected={open} />
      </div>
      <div
        className={`select-none text-sm font-semibold leading-relaxed transition-all duration-300 ${
          open
            ? "max-h-40 mb-2 mt-4 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="w-full h-full bg-primary">
        <div
          className={`z-12 flex flex-row justify-between px-8 py-4 fixed top-0 w-screen h-16 transition-colors duration-500 ${
            scrolled ? "bg-primary/95 backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <Logo />
          <div className="flex gap-3">
            <a
              className={`flex gap-2  cursor-pointer items-center px-3 border-2 border-white justify-center
                rounded-md text-white text-sm font-header transition-all duration-500
                hover:text-white hover:bg-white/30 ${
                  scrolled ? "opacity-100" : "opacity-0"
                }`}
            >
              Blank Board
            </a>
            <a
              className={`flex gap-2  cursor-pointer items-center px-3 border-2 border-accent bg-accent justify-center
                rounded-md text-primary text-lg font-header transition-all duration-500
                hover:text-white hover:bg-accent/90 ${
                  scrolled ? "opacity-100" : "opacity-0"
                }`}
            >
              Demo
            </a>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            src="/demo2.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary via-primary/90 via-30% to-transparent to-90% z-10 pointer-events-none" />
        </div>

        <div className=" flex flex-col items-center">
          <div
            className="z-10 w-screen mx-auto px-6 pt-48 md:pt-64 text-primary-text 
          flex flex-col items-center"
          >
            {/* HERO */}

            <div
              className="max-w-lg self-center w-full text-center
            rounded-lg p-2 mb-48"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 leading-12 sm:leading-14 md:leading-18">
                Draw more. Organize less.
              </h1>
              <p className="text-sm text-accent font-bold">
                Open Beta • Special Access
              </p>
              <p className="text-md mb-14 w-full">
                For illustrators who’d rather sketch than spend 30 minutes
                <br />
                building a ref board.
              </p>

              {/* CTA */}
              <div className="flex flex-col items-center justify-center gap-2">
                {/* <a
                  href="/app"
                  title="Start a blank board"
                  className="px-6 py-2 border-2 border-accent text-accent transition-all duration-300
                font-header rounded-md text-md hover:bg-accent/80 hover:text-white"
                >
                  Start a Blank Board
                </a> */}
                <a
                  href="/demo"
                  className="flex gap-2 items-center px-6 py-2 bg-accent justify-center
                rounded-md text-primary text-lg font-header transition-all duration-300
                hover:text-white hover:bg-accent/90"
                >
                  <FaPlay className="size-4 translate-y-[1px]" />
                  Try a Demo Board
                </a>
                <a
                  className="font-header font-semibold hover:underline hover:text-accent 
                cursor-pointer select-none transition-all duration-300"
                >
                  Or Start a Blank Board
                </a>
              </div>
            </div>

            {/* FEATURES */}
            <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12 mb-32 text-left">
              <Features />
            </div>

            <Image
              src="/1white.png"
              alt="Board not found"
              width={375}
              height={150}
              className="mb-4"
            />

            {/* PRICING */}

            <div className="mb-24 max-w-3xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                <PricingTable />
              </div>
            </div>

            <div className="w-full max-w-2xl mx-auto px-1 md:px-6 mb-20">
              <h2 className="text-4xl font-semibold mb-6 text-center">FAQ</h2>
              <div className="space-y-4">
                <FAQItem question="Do I need to sign up to use the app?">
                  No sign-up needed to make and share boards! Signup is only
                  neccesary if you&apos;re on paid tier (which...makes sense) or
                  if you want to <strong>claim</strong> a board.
                </FAQItem>
                <FAQItem question="Who can see or access my board?">
                  Your boards are{" "}
                  <span className="text-accent font-bold">
                    private by default
                  </span>
                  , meaning they’re unlisted and can’t be found unless you share
                  the link. When you do share a board, anyone with the link can
                  view and edit it <strong>unless</strong> you’ve signed in and
                  claimed it.
                </FAQItem>
                <FAQItem question="What are the Free Tier limits?">
                  Free users get{" "}
                  <span className="text-accent font-bold">full access</span>,
                  and no features are locked. We just auto delete boards after 7
                  days to keep things light and storage friendly. It’s perfect
                  for daily studies, throwaway sketch practice, or casual
                  moodboarding. And you can still keep it by upgrading before
                  they expire.
                </FAQItem>
                <FAQItem question="Is the second tier really unlimited storage?">
                  During beta, yes! We&apos;ll introduce tiers later, but early
                  users keep their ability to upload unlimited images and lock
                  in their pricing{" "}
                  <span className="text-accent font-bold">now and forever</span>
                  . We may add limits when we support larger files (like video
                  or uncompressed uploads), but this won&apos;t affect your
                  current tier.
                </FAQItem>
                <FAQItem question="Do you provide one time payment options?">
                  I really love how Clip Studio Paint and Procreate are one time
                  payments. But since we&apos;re on the cloud and have ongoing
                  storage/hosting costs on our end, we&apos;ve gone with a
                  monthly model to keep things simple.
                </FAQItem>
                <FAQItem question="What happens to my boards if I cancel?">
                  To keep storage costs manageable (and protect against abuse),
                  boards are deleted 14 days after cancellation. But feel free
                  to reach out if you would like to work something out!
                </FAQItem>
                <FAQItem question="What's the best way to reach out?">
                  We would love to hear from you:{" "}
                  <button
                    type="button"
                    className="w-fit cursor-pointer text-accent hover:text-accent hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigator.clipboard.writeText("andrew@jonadrew.com");
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                  >
                    {copiedEmail ? "Email Copied!" : "Click to Copy Email"}
                  </button>
                </FAQItem>
              </div>
            </div>

            <Image
              src="/2white.png"
              alt="Board not found"
              width={375}
              height={150}
            />
          </div>
          {/* FOOTER */}
          <footer className="mb-8">
            <p className="font-mono tracking-tightest text-xs font-semibold">
              Built by Andrew Yong.
              {/* <a
              href="mailto:you@example.com"
              className="underline hover:text-primary"
            >
              Email me
            </a> */}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
