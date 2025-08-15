// landing page stuff

import React from "react";
import { FaRandom } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { IoLibrary } from "react-icons/io5";

type FeatureItemProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  highlightedIndexes: string[];
};

function FeatureItem({
  title,
  icon,
  children,
  highlightedIndexes,
}: FeatureItemProps) {
  const isHighlighted = highlightedIndexes.includes(title);

  return (
    <div
      data-id={title}
      data-marque-track
      className={`transition-all duration-200 ${
        isHighlighted ? "text-accent" : "text-off-white"
      }`}
    >
      <div className="flex flex-col gap-2 mb-4">
        <div className="text-accent text-xl">{icon}</div>
        <h2 className="font-semibold text-xl h-12">{title}</h2>
      </div>
      {/* <div className="h-px bg-stone-300 w-8 my-4" /> */}
      <p className="leading-relaxed text-[0.9375rem]">{children}</p>
      {/* <div className="text-accent text-xl mt-4">{icon}</div> */}
    </div>
  );
}

export default function Features({
  highlightedIndexes,
}: {
  highlightedIndexes: string[];
}) {
  return (
    <>
      <FeatureItem
        icon={<IoLibrary />}
        title="Find your References Easily"
        highlightedIndexes={highlightedIndexes}
      >
        Build a library of images you can <strong>use again and again</strong>.
        So you don&apos;t need to maintain 50 Pinterest boards or 200 folders.
      </FeatureItem>

      <FeatureItem
        icon={<FaRandom />}
        title="View them However you want"
        highlightedIndexes={highlightedIndexes}
      >
        View your images in a grid or freeform canvas. Pin an image. Split
        things into sections. You&apos;re not <strong>constrained</strong> to a
        single canvas (but you still can).
      </FeatureItem>

      <FeatureItem
        icon={<FaImage />}
        title="Come back to where you left off"
        highlightedIndexes={highlightedIndexes}
      >
        Keep all your ideas in <strong>one place</strong>, so you don&apos;t
        need to open new files everytime you switch projects.
      </FeatureItem>
    </>
  );
}
