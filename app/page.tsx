// landing page

"use client";

import Logo from "@/components/ui/logo";

import { useEffect, useState } from "react";
import FillingDot from "@/components/ui/filling-dot";
import PricingTable from "@/components/landing-page/pricing-v2";
import Features from "@/components/landing-page/features";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";
import {
  DASHBOARD_LINK,
  DEMO_BOARD_LINK,
  LOGIN_LINK,
  NEW_BOARD_LINK,
} from "@/types/constants";
import Link from "next/link";
import { FaPinterestP } from "react-icons/fa6";
import { SiAdobephotoshop } from "react-icons/si";
import { useMetadataStore } from "@/store/metadata-store";
import {
  GlobalAnnouncement,
  SHOW_GLOBAL_ANNOUNCEMENT,
} from "@/types/constants/error-message";

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
        className={`select-none text-[0.9375rem] leading-relaxed transition-all duration-300 ${
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

function ComparisonTile({
  title,
  icon,
  children,
  highlight = false,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border-2 rounded-lg p-4 ${
        highlight ? "border-accent bg-accent/10" : "border-border bg-primary/20"
      }`}
    >
      <div className="flex flex-row gap-3 items-center mb-2 ">
        <div>{icon}</div>
        <h3 className={`text-xl font-semibold ${highlight ? "" : ""}`}>
          {title}
        </h3>
      </div>

      <p className="text-[0.9375rem]">{children}</p>
    </div>
  );
}

export default function Home() {
  // const [copiedEmail, setCopiedEmail] = useState(false);
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
              className={`hidden sm:flex gap-2  cursor-pointer items-center px-3 border-2 border-white justify-center
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
              className={`hidden sm:flex gap-2  cursor-pointer items-center px-3 border-2 border-white justify-center
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
            className={`flex gap-2  cursor-pointer items-center px-3 border-2 border-accent bg-accent justify-center
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
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-12 sm:leading-14 md:leading-18">
                Draw more. Organize less.
              </h1>
              <div className="flex flex-col items-center">
                <p className="max-w-lg text-sm text-accent font-bold">
                  Early testing • Come try it!
                </p>
                {/* <p className="text-md mb-14 w-full">
                  For illustrators who’d rather sketch than spend 30 minutes
                  <br />
                  building a ref board.
                </p> */}
                <p className="text-lg mb-14 w-full font-semibold">
                  For illustrators who’d rather draw than organize reference
                  images
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center justify-center gap-2">
                <Link
                  href={DEMO_BOARD_LINK}
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

          <div className="flex flex-col items-center gap-2 mb-32">
            <h1 className="font-semibold text-lg">A Mudboard in the wild</h1>
            <div className="max-w-4xl rounded-lg overflow-hidden border-3 border-secondary">
              <Image
                src={"/screeny.png"}
                alt={"Mudboard Screenshot"}
                width={1860}
                height={971}
              />
            </div>
          </div>

          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-0 mb-24">
            <h2 className="text-2xl font-bold mb-6 text-center">
              How is Mudboard different?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
              <ComparisonTile
                title="Pinterest"
                icon={<FaPinterestP className="size-5" />}
              >
                Great for collecting and discovering ideas. Mudboard focuses on{" "}
                <strong>organizing and viewing</strong> your images.
              </ComparisonTile>

              <ComparisonTile
                title="PureRef"
                icon={
                  <Image
                    src="/purref.png"
                    alt="Mudboard M"
                    height={18}
                    width={18}
                    className="-translate-y-[2px]"
                  />
                }
              >
                Amazing for custom layouts. But Mudboard trades flexibility for
                speed, so is designed to <strong>get you going faster</strong>.
              </ComparisonTile>

              <ComparisonTile
                title="Drawing Apps"
                icon={<SiAdobephotoshop className="size-5" />}
              >
                Mudboard doesn&apos;t replace these. Instead, it helps organize
                references outside your canvas so you can{" "}
                <strong> focus on drawing</strong>.
              </ComparisonTile>

              <ComparisonTile
                title="Mudboard"
                highlight
                icon={
                  <Image
                    src="/M.png"
                    alt="Mudboard M"
                    height={22}
                    width={22}
                    className="-translate-y-[2px]"
                  />
                }
              >
                I wanted something to drop in images and draw. No setup, no
                shortcuts to memorize, no endless rearranging. Hopefully it
                helps you too!
              </ComparisonTile>
            </div>
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
            <h2 className="text-2xl font-bold text-center">
              Planned Pricing (not implemented yet)
            </h2>
            {/* <p className="text-center mb-8 text-sm">
              Pricing isn&apos;t final yet, but here&apos;s the ballpark
              estimate for what I&apos;ll launch with. Later I was probably
              gonna do a $6-7 tier with more limited features and a $12-15 tier.
              Really, the reason I charge is to protect me from storage costs.
            </p> */}
            <p className="text-center text-sm text-muted mb-6 font-semibold">
              Firsts 300 users get the Lifetime license for <strong>$20</strong>{" "}
              (normally $25) + an extra 200 images.
            </p>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left mb-2"> */}
            <div>
              <PricingTable />
            </div>
            {/* <p className="text-center text-sm font-semibold">
              *Boards currently have a limit of around 1k images
            </p> */}
          </div>

          <div className="w-full max-w-2xl mx-auto px-1 md:px-6 mb-20">
            <h2 className="text-4xl font-semibold mb-6 text-center">FAQ</h2>
            <div className="space-y-4">
              <FAQItem question="Do I need to sign up to use the app?">
                <span className="text-accent font-bold">No sign-up needed</span>{" "}
                to make and share boards! You only need to sign up if you want
                to <strong>save</strong> a board.
              </FAQItem>
              {/* <FAQItem question="What does it mean to claim a board?">
                Claiming a board means that it&apos;s linked to your account and
                no one can else edit it. Note that claiming does not neccesarily
                mean that it won&apos;t expire, since Free accounts can only
                keep 1 board around permanently.
              </FAQItem> */}
              <FAQItem question="Who can see or edit my board?">
                All boards are{" "}
                <span className="text-accent font-bold">
                  private by default
                </span>
                . They can&apos;t be found unless you share the link, and
                can&apos;t be edited unless you allow it in your settings.
              </FAQItem>
              {/* <FAQItem question="How does Free Tier work?">
                Free users get{" "}
                <span className="text-accent font-bold">full access</span> to
                all features. You can create any number of boards, but only 1 of
                those will stay forever. The rest will be auto deleted after 7
                days to keep things light and storage friendly, or you can keep
                them too by upgrading before they expire!
              </FAQItem>
              <FAQItem question="Is the second tier really unlimited storage?">
                During beta, yes! We&apos;ll introduce tiers later, but early
                users keep their ability to upload unlimited images and lock in
                their pricing{" "}
                <span className="text-accent font-bold">now and forever</span>.
                We may add limits when we support larger files (like video or
                uncompressed uploads), but this won&apos;t affect your current
                tier.
              </FAQItem> */}
              {/* <FAQItem question="Do you provide one time payment options?">
                I really love how Clip Studio Paint and Procreate are one time
                payments. But since we&apos;re on the cloud and have ongoing
                storage/hosting costs on our end, we&apos;ve gone with a monthly
                model to keep things simple (and so we don&apos;t need to run
                ads).
              </FAQItem> */}
              {/* <FAQItem question="Will my boards be deleted after pricing is implemented?">
                Right now no (mainly cause I haven&apos;t built the
                deletion/limit part yet lol). I do delete{" "}
                <strong>unsaved boards</strong> after 7 days of creation, but if
                you create and save a board before limits are in place, I
                probably won&apos;t mess with it (
                <span className="text-accent font-bold">
                  but be reasonable please
                </span>
                ...don&apos;t go making like 20 test boards)
              </FAQItem> */}
              {/* <FAQItem question="What happens to my boards if I cancel?">
                To keep storage costs manageable (and protect against abuse),
                boards are deleted 7 days after cancellation. But feel free to
                reach out if you would like to work something out!
              </FAQItem> */}
              {/* <FAQItem question="What's the best way to reach out?">
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
              </FAQItem> */}
              <FAQItem question="Will you train AI or sell my artwork/data?">
                No.
              </FAQItem>
              <FAQItem question="Will you add [that feature I’m hoping for]?">
                Probably! You can check out this{" "}
                <Link
                  href="/roadmap"
                  className="text-accent underline hover:text-white transition-all duration-200 font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  public roadmap
                </Link>{" "}
                of what&apos;s planned/prioritized.
                <br />
                <br />
                If you&apos;d like to get involved and have a say with
                Mudboard&apos;s direction, you can{" "}
                <a
                  href="https://forms.gle/QA96JUcRRP5YSqRT6"
                  className="text-accent underline hover:text-white transition-all duration-200 font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  sign up here
                </a>{" "}
                to get updates or even become a tester!
              </FAQItem>
              {/* <FAQItem question="How do I reach out or get involved?">
                Great question! We’re always looking for early testers and folks
                to help shape the direction of this app. You can find out{" "}
                <Link
                  href="/get-involved"
                  className="text-accent underline hover:text-white transition-all duration-200 font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  more info here
                </Link>
                .
              </FAQItem> */}
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
