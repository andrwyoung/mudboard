import Link from "next/link";
import { Button } from "../ui/button";
import { FaXmark, FaCheck } from "react-icons/fa6";

type Feature = {
  label: string;
  status: "good" | "bad" | "neutral";
};

type Plan = {
  name: string;
  description?: string;
  price: string;
  oldPrice?: string;
  features: Feature[];
  ctaText?: string;
  ctaHref?: string;
  highlight?: boolean;
  badge?: string;
  badgeColor?: string;
  note?: string;
};

const plans: Plan[] = [
  {
    name: "Starter",
    description: "Try it out!",
    price: "$0",
    features: [
      { label: "200 images", status: "good" },
      { label: "All core features", status: "good" },
      { label: "Boards are deleted 7 days after creation", status: "bad" },
      { label: "No collaboration", status: "bad" },
    ],
    ctaText: "Try the Demo",
    ctaHref: "/demo",
  },
  {
    name: "License",
    description: "Buy once. Keep forever",
    price: "$20 one-time",
    oldPrice: "$25",
    features: [
      { label: "1000 images included (+200 for early users)", status: "good" },
      { label: "Boards and Images will never be deleted", status: "good" },
      { label: "All core features", status: "good" },
      { label: "Early user street cred", status: "good" },
      // { label: "No collaboration", status: "bad" },
      // { label: "No uncompressed uploads", status: "bad" },
    ],
    ctaText: "Join the Waitlist",
    ctaHref: "https://forms.gle/2nwUurgKJBYAFxCQ6",
    highlight: true,
    badge: "Beta Pricing",
    badgeColor: "bg-accent text-primary",
    note: "Add more storage anytime",
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
    // description: "For professionals and teams (Coming Soon)",
    price: "TBD",
    features: [
      // { label: "Unlimited images", status: "neutral" },
      { label: "Timed Gesture Drawings", status: "neutral" },
      { label: "Collaboration + Versioning", status: "neutral" },
      { label: "Uncompressed uploads", status: "neutral" },
      { label: "Portfolio Features", status: "neutral" },
      // { label: "Early access to new features", status: "neutral" },
    ],
    // ctaText: "Upgrade to Pro",
    // ctaHref: "/upgrade",
    // badge: "Requires License",
    badgeColor: "bg-muted text-primary",
    // note: "Only available after Lifetime License purchase",
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
            <div className="flex-grow mb-6">
              <h3 className="text-md font-bold mb-2">{plan.name}</h3>
              <div className="flex flex-col mb-8 h-12">
                <p className="font-header text-2xl font-bold ">{plan.price}</p>
                {plan.oldPrice && (
                  <p className="font-header text-xs font-semibold text-white">
                    Normally {plan.oldPrice}
                  </p>
                )}
              </div>
              <p className="text-sm mb-2 font-semibold">{plan.description}</p>
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
                      <div className="h-1 w-1 bg-white rounded-full"></div>
                    )}
                    {feature.label}
                  </li>
                ))}
              </ul>

              {plan.note && (
                <p className="text-xs mt-4 text-muted">{plan.note}</p>
              )}
            </div>
            {plan.ctaText && plan.ctaHref && (
              <Link href={plan.ctaHref} className="w-full mt-4 block">
                <Button
                  variant="secondary"
                  className={`w-full font-header ${
                    plan.highlight ? "bg-secondary" : ""
                  }`}
                >
                  {plan.ctaText}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Storage Add-ons */}
      <div className="mt-10 text-center text-muted">
        <h2 className="mb text-xl font-semibold">Want more images?</h2>
        <p className="text-xs mb-4 text-muted font-semibold">
          *More storage can only be bought with a license
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-primary-text">
          <StorageBox title="1,000 Images" price="$6" />
          <StorageBox title="5,000 Images" price="$16" />
          <StorageBox
            title="10,000 Images"
            price="$20"
            highlight
            badge="Set and Forget"
          />
        </div>
      </div>
    </>
  );
}
