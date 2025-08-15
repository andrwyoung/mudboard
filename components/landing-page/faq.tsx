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
            ? "max-h-64 mb-2 mt-4 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="w-full max-w-2xl mx-auto px-1 md:px-6 mb-32">
      <h2 className="text-4xl font-semibold mb-6 text-center">FAQ</h2>
      <div className="space-y-4">
        <FAQItem question="Do I need to sign up to use the app?">
          <span className="text-accent font-bold">No sign-up needed</span> to
          make and share boards! You only need to sign up if you want to{" "}
          <strong>save</strong> a board.
        </FAQItem>
        {/* 
        <FAQItem question="What does Early Supporter do?">
          The Early Supporter license is a{" "}
          <span className="font-bold text-accent">one-time payment</span>, that
          gives you <strong>lifetime access</strong> to all currently listed
          features. It&apos;s a thank-you for supporting the app early. You’ll
          keep these features forever, even if we introduce monthly plans later.
          <br />
          <br />
          Future tools (like collaboration or portfolio features) may live in
          new plans, but your core experience <strong>won’t change</strong>.
        </FAQItem> */}

        {/* <FAQItem question="Will I ever be forced into a subscription?">
          No. The lifetime license is built to have{" "}
          <span className="font-bold text-accent">everything you need</span> for
          a personal use tool. None of those features (or their future updates)
          will be gated.
          <br />
          <br /> The monthly plan is for teams and pros who need more: like real
          time collaboration or more granular sharing controls. If you
          don&apos;t need those, <strong>you&apos;re not missing out</strong>.
          <br />
          <br />I don&apos;t like it when tools suddenly switch to subscription.
          So I&apos;m trying to set expectations early: yes, there is an option
          for subscription. But it is <strong>not required</strong> to access
          the core tool
        </FAQItem> */}

        {/* <FAQItem question="Will I ever be forced into a subscription?">
          No. I&apos;m commited to always providing a{" "}
          <strong>one-time payment</strong> option for the core features of the
          tool.
          <br />
          <br />
          Here&apos;s the exact details of what that means (and doesn&apos;t
          mean):{" "}
          <a
            href="https://jondrew.notion.site/Mudboard-Pricing-2332e809fa4e802dab4be35bb639e5d8?pvs=74"
            className="text-accent underline hover:text-off-white transition-all duration-200 font-bold"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Lifetime Promise
          </a>
        </FAQItem> */}

        <FAQItem question="Who can see my board/sections?">
          All boards and sections are{" "}
          <span className="text-accent font-bold">private by default</span>.
          They can&apos;t be found unless you share the link, and can&apos;t be
          edited by others (at the moment).
        </FAQItem>

        <FAQItem question="Will you train AI or sell my artwork/data?">
          No.
        </FAQItem>

        <FAQItem question="Will you add [that feature I’m hoping for]?">
          Probably! You can check out this{" "}
          <Link
            href="/roadmap"
            className="text-accent underline hover:text-off-white transition-all duration-200 font-bold"
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
            className="text-accent underline hover:text-off-white transition-all duration-200 font-bold"
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
