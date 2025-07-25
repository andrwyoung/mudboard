"use client";

import { FaFigma, FaFolder, FaPinterestP } from "react-icons/fa6";
import Image from "next/image";

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

export default function ComparisonTable() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-0 mb-32">
      <h2 className="text-2xl font-bold text-center mb-6">
        How is Mudboard different?
      </h2>
      {/* <p className="text-[0.9375rem] mb-6 text-center">
        Mudboard fills the gap between inspiration and creation.
      </p> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
        <ComparisonTile
          title="Pinterest"
          icon={<FaPinterestP className="size-5" />}
        >
          Great for collecting and discovering ideas. Mudboard helps you{" "}
          <span className="text-accent font-bold">organize </span> what you need
          and turn collections into clean, shareable assets.
        </ComparisonTile>

        {/* <ComparisonTile
          title="PureRef"
          icon={
            <Image
              src="/purref.png"
              alt="PureRef logo"
              height={18}
              width={18}
              className="-translate-y-[2px]"
            />
          }
        >
          Offers deep control and flexibility. Mudboard keeps the freedom and
          adds <strong>speed</strong>, so you can build faster and{" "}
          <span className="text-accent font-bold">share them</span> just as
          easily.
        </ComparisonTile> */}

        <ComparisonTile
          title="Figma/Slides"
          icon={<FaFigma className="size-5" />}
        >
          Great for final decks or high-effort design. Mudboard is for{" "}
          <span className="text-accent font-bold">quick visual thinking</span>,
          with flexibility and structure to iterate.
        </ComparisonTile>

        <ComparisonTile
          title="Screenshots"
          icon={<FaFolder className="size-5" />}
        >
          This used to be my default. Mudboard lets you{" "}
          <strong>visually organize and export</strong> instead of digging
          through image piles.
        </ComparisonTile>
        {/* 
        <ComparisonTile
          title="Drawing Apps"
          icon={<SiAdobephotoshop className="size-5" />}
        >
          Mudboard doesn&apos;t replace these. Instead, it helps organize
          references so you can <strong>focus on drawing</strong>.
        </ComparisonTile> */}

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
          Built for visual creatives who need fast, layout-faithful boards. Have
          a workspace to <strong>manage, reuse and share</strong> all your
          ideas.
        </ComparisonTile>
      </div>
    </div>
  );
}
