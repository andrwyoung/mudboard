import { Button } from "../ui/button";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText?: string;
  ctaHref?: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Try it out, no account needed.",
    features: ["Access all features", "Boards are deleted after 14 days"],
    ctaText: "Try the Demo",
    ctaHref: "/demo",
  },
  {
    name: "Beta Pricing",
    price: "$5 / month",
    description: "Unlimited storage while in beta.",
    features: [
      "Unlimited image uploads + boards!",
      "Priority Support",
      "Be the first to Request Features",
      "Early supporter street cred",
    ],
    ctaText: "Start Creating",
    ctaHref: "/app",
    highlight: true,
  },
  {
    name: "Pro (Coming Soon)",
    price: "TBD",
    description: "More features. More tools.",
    features: [
      "Video support",
      "Uncompressed file uploads",
      "Collaboration + Versioning",
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
            <Button
              // href={plan.ctaHref}
              variant={"secondary"}
              className={`font-header ${plan.highlight && "bg-secondary"}`}
            >
              {plan.ctaText}
            </Button>
          )}
        </div>
      ))}
    </>
  );
}
