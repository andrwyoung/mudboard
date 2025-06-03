// landing page stuff. the pricing tiers

import { JSX } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: (string | JSX.Element)[];
  ctaText?: string;
  ctaHref?: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Try it out!",
    features: [
      "Access all features",
      "1 forever board",
      "All other boards are deleted after 7 days",
    ],
    ctaText: "Try the Demo",
    ctaHref: "/demo",
  },
  {
    name: "Early Supporter",
    price: "$5 / month",
    description: "Pricing is for early supporters in Beta",
    features: [
      <span className="font-header " key="unlimited">
        <span className="font-header font-bold text-accent">Unlimited</span>{" "}
        image uploads and boards!
      </span>,
      "Priority Support",
      "Be the first to Request Features",
      "Lock in price forever",
      "Early supporter street cred",
    ],
    ctaText: "Join Waitlist",
    ctaHref: "/get-involved",
    highlight: true,
  },
  {
    name: "More Coming Soon",
    price: "TBD",
    description: "Here are some of my ideas:",
    features: [
      "Collaboration + Versioning",
      "Timed Gesture Drawings",
      "Portfolio features",
      "Video support",
      "Uncompressed file uploads",
    ],
  },
];

export default function PricingTable() {
  return (
    <>
      {plans.map((plan, i) => (
        <div
          key={i}
          className={`rounded-lg border-2 p-6 flex flex-col justify-between transition-shadow hover:shadow-md
            ${
              plan.highlight
                ? "border-secondary bg-secondary/5"
                : "border-border"
            }`}
        >
          <div>
            <h3 className="text-md font-bold ">{plan.name}</h3>
            <h3 className="text-2xl mb-4 font-bold">{plan.price}</h3>
            <p className="text-xs text font-semibold mb-12 h-8">
              {plan.description}
            </p>
            <ul className="text-sm mb-6 space-y-3">
              {plan.features.map((f, j) => (
                <li className="font-medium font-header" key={j}>
                  • {f}
                </li>
              ))}
            </ul>
          </div>
          {plan.ctaHref && plan.ctaText && (
            <Link href={plan.ctaHref} className="w-full">
              <Button
                variant={"secondary"}
                className={`w-full font-header ${
                  plan.highlight && "bg-secondary"
                }`}
              >
                {plan.ctaText}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </>
  );
}
