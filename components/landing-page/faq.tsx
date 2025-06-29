import Link from "next/link";
import { INTEREST_LINK } from "@/types/constants";
import { useState } from "react";
import FillingDot from "@/components/ui/filling-dot";

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

export default function FAQ() {
  //   const [copiedEmail, setCopiedEmail] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-1 md:px-6 mb-20">
      <h2 className="text-4xl font-semibold mb-6 text-center">FAQ</h2>
      <div className="space-y-4">
        <FAQItem question="Do I need to sign up to use the app?">
          <span className="text-accent font-bold">No sign-up needed</span> to
          make and share boards! You only need to sign up if you want to{" "}
          <strong>save</strong> a board.
        </FAQItem>

        <FAQItem question="Who can see or edit my board?">
          All boards are{" "}
          <span className="text-accent font-bold">private by default</span>.
          They can&apos;t be found unless you share the link, and can&apos;t be
          edited unless you allow it in your settings.
        </FAQItem>

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
          If you&apos;d like to get involved and have a say with Mudboard&apos;s
          direction, you can{" "}
          <a
            href={INTEREST_LINK}
            className="text-accent underline hover:text-white transition-all duration-200 font-bold"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            sign up here
          </a>{" "}
          to get updates or even become a tester!
        </FAQItem>
      </div>
    </div>
  );
}
