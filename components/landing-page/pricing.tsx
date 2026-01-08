import Link from "next/link";
import { Button } from "../ui/button";
import { FaXmark, FaCheck } from "react-icons/fa6";
import { FREE_LICENSE_LINK, INTEREST_LINK } from "@/types/constants";
import React from "react";

type Feature = {
  label: React.ReactNode;
  status: "good" | "bad" | "neutral";
};

type Plan = {
  name: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  features: Feature[];
  ctaText?: string;
  ctaHref?: string;
  cta?: React.ReactNode;
  highlight?: boolean;
  badge?: string;
  badgeColor?: string;
  note?: React.ReactNode;
};

const plans: Plan[] = [
  {
    name: "Free",
    description: "Try it out!",
    price: "$0",
    features: [
      { label: "3 Boards", status: "good" },
      { label: "All features in the Lifetime License", status: "good" },
      // { label: "No publishing Mudkits", status: "bad" },
    ],
    ctaText: "Try the Demo",
    ctaHref: "/demo",
    cta: (
      <Link
        href="/demo"
        className="w-full mt-4 block"
        data-umami-event={`Landing page: Pricing CTA Demo Board`}
      >
        <Button variant="secondary" className={`w-full font-header`}>
          Try the Demo
        </Button>
      </Link>
    ),
    // note: "*During testing: Reach out to remove 3 board limit.",
  },
  {
    name: "Lifetime License",
    description: "Lifetime access to all current features:",
    price: "$0",
    oldPrice: "Grab a License Early! ($40 later)",
    features: [
      {
        label: (
          <>
            Generous storage
            <br /> (10k+ images)
          </>
        ),
        status: "good",
      },
      { label: "Unlimited Boards and Sections", status: "good" },
      // { label: "All core features", status: "good" },
      { label: "Save, Clone and Reuse Sections", status: "good" },
      { label: "Early user street cred", status: "good" },
      {
        label: <>I like you a lot</>,
        status: "good",
      },
      // { label: "No collaboration", status: "bad" },
      // { label: "No uncompressed uploads", status: "bad" },
    ],
    ctaText: "Join the Waitlist",
    ctaHref: INTEREST_LINK,
    // cta: <BuyButton />,
    cta: (
      <a
        href={FREE_LICENSE_LINK}
        className="w-full mt-4 block"
        data-umami-event={`Landing page: Pricing CTA Demo Board`}
        target="_blank"
        rel="noopener noreferrer"
        title="Get Free Lifetime License"
      >
        <Button
          variant="secondary"
          className={`w-full font-header bg-secondary`}
        >
          {/* Join the Waitlist */}
          Get Free License
        </Button>
      </a>
    ),
    highlight: true,
    badge: "Beta Testing",
    badgeColor: "bg-accent text-primary",
    note: (
      <span>
        <a
          href="https://jondrew.notion.site/Mudboard-Pricing-2332e809fa4e802dab4be35bb639e5d8?pvs=74"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline hover:text-off-white transition-all duration-200 font-bold"
        >
          More Details (Lifetime Promise)
        </a>
      </span>
    ),
  },
  // {
  //   name: "Pro",
  //   description: "Built for pros & teams",
  //   price: "$7 / month",
  //   features: [
  //     { label: "Unlimited images", status: "good" },
  //     { label: "Collaboration", status: "good" },
  //     { label: "Uncompressed uploads (coming soon)", status: "good" },
  //     { label: "Early access to new features", status: "good" },
  //   ],
  //   // ctaText: "Upgrade to Pro",
  //   // ctaHref: "/upgrade",
  //   badge: "Requires License",
  //   badgeColor: "bg-muted text-primary",
  //   note: "Only available after Lifetime License purchase",
  // },

  {
    name: "More Coming Soon",
    description: "Monthly plan for teams",
    // price: "TBD",
    features: [
      // { label: "Unlimited images", status: "neutral" },
      // { label: "Timed Gesture Drawings", status: "neutral" },
      { label: "Collaboration + Versioning", status: "neutral" },
      { label: "Uncompressed uploads", status: "neutral" },
      { label: "Advanced sharing controls", status: "neutral" },
      { label: "Image Search", status: "neutral" },
      // { label: "Note: plan to implement some monthly plan", status: "neutral" },
    ],
    // ctaText: "Upgrade to Pro",
    // ctaHref: "/upgrade",
    // badge: "Requires License",
    badgeColor: "bg-muted text-primary",
    note: (
      <span>
        Curious about what’s coming?
        <br />
        <a
          href="https://jondrew.notion.site/Mudboard-Roadmap-2162e809fa4e80eb94add8aa315c769d?source=copy_link"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline hover:text-off-white transition-all duration-200 font-bold"
        >
          → Check the roadmap
        </a>
      </span>
    ),
  },
];

export function StorageBox({
  title,
  price,
  description,
  highlight = false,
  badge,
}: {
  title: string;
  price: string;
  description?: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-lg py-2 px-4 flex flex-col ${
        highlight
          ? "border-2 border-accent bg-accent/10"
          : "border-2 border-border bg-primary/10"
      }`}
    >
      <h4 className="font-bold text-sm mb-1 mt-1">{title}</h4>
      <p className="text-xl font-header font-semibold mb-1">{price}</p>
      <p className="text-xs">{description}</p>
      {badge && (
        <div className="text-xs font-bold text-accent mb-1">{badge}</div>
      )}
    </div>
  );
}

export default function PricingTable() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative border-2 flex flex-col rounded-md px-4 py-6 ${
              plan.highlight
                ? "border-accent bg-accent/10"
                : "border-border bg-primary/20"
            }`}
          >
            {plan.badge && (
              <div
                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-md font-bold ${plan.badgeColor}`}
              >
                {plan.badge}
              </div>
            )}
            <div className="grow mb-6">
              <h3 className="text-md font-bold mt-4 mb-2">{plan.name}</h3>
              <div className="flex flex-col mb-8 h-12">
                <p className="font-header text-2xl font-bold ">{plan.price}</p>
                {plan.oldPrice && (
                  <p className="font-header text-xs font-semibold text-off-white">
                    {plan.oldPrice}
                  </p>
                )}
              </div>
              <p className="text-sm mb-4 font-semibold">{plan.description}</p>
              <ul className="text-sm mb-2 space-y-3">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex flex-row gap-2 items-center font-semibold font-header"
                  >
                    {feature.status === "good" && (
                      <FaCheck className="size-3.5 flex-none" />
                    )}
                    {feature.status === "bad" && (
                      <FaXmark className="size-4 flex-none" />
                    )}
                    {feature.status === "neutral" && (
                      <div className="h-1 w-1 bg-primary-foreground rounded-full"></div>
                    )}
                    {feature.label}
                  </li>
                ))}
              </ul>

              {plan.note && (
                <p className="text-xs mt-4 text-muted">{plan.note}</p>
              )}
            </div>
            {plan.cta}
          </div>
        ))}
      </div>

      {/* Storage Add-ons */}
      {/* <div className="mt-10 text-center text-muted">
        <h2 className="mb text-xl font-semibold">Want more images?</h2>
        <p className="text-xs mb-4 text-muted font-semibold">
          *More storage can only be bought with a lifetime license
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-off-white">
          <StorageBox title="1,000 Images" price="$6" />
          <StorageBox title="5,000 Images" price="$16" />
          <StorageBox
            title="10,000 Images"
            price="$20"
            highlight
            badge="Set and Forget"
          />
        </div>
      </div> */}
    </>
  );
}
