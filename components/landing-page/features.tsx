// landing page stuff

import React from "react";
import { FaRandom } from "react-icons/fa";
import { FaImage, FaLeaf } from "react-icons/fa6";

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
        isHighlighted ? "text-accent" : "text-white"
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
      {/* <FeatureItem icon={<FaSun />} title="Focus on drawing">
        Spend <strong>more time drawing</strong> than managing your references.
        Drop in images and get started. No setup,{" "}
        <strong>no distractions</strong>.
      </FeatureItem> */}
      {/* <FeatureItem
        icon={<FaRandom />}
        title="Flexible Layouts"
        highlightedIndexes={highlightedIndexes}
      >
        <strong>Swap freely</strong> between a grid and freeform. Structure when
        you need, freedom when you don&apos;t.
      </FeatureItem> */}

      <FeatureItem
        icon={<FaLeaf />}
        title="Find your References Easily"
        highlightedIndexes={highlightedIndexes}
      >
        Build a library of images you can <strong>use again and again</strong>.
        So you don&apos;t need to maintain 50 Pinterest boards or 200 folders.
      </FeatureItem>

      {/* <FeatureItem
        icon={<FaImage />}
        title="Show Off Your Work"
        highlightedIndexes={highlightedIndexes}
      >
        <strong>Export exactly</strong> as you arranged it. No formatting or
        screenshots. Just clean, sharable results.
      </FeatureItem> */}

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

      {/* <FeatureItem
        icon={<FaLeaf />}
        title="Reuse Your Ideas"
        highlightedIndexes={highlightedIndexes}
      >
        Save your best images into sets you can <strong>reuse later</strong>. So
        you always can tap into past ideas.
      </FeatureItem> */}
      {/* <FeatureItem
        icon={<FaSeedling />}
        title="Inspire others"
        highlightedIndexes={highlightedIndexes}
      >
        Share your Mudkits in the{" "}
        <span className="text-accent font-bold"> Greenhouse</span>, a public
        library of inspiring reference sets.
      </FeatureItem> */}
      {/* <FeatureItem icon={<FaSeedling />} title="Inspire others">
        Share your Mudkits to the public{" "}
        <span className="text-accent font-bold"> Greenhouse</span> to showcase
        your collections and build your <strong>library</strong>.
      </FeatureItem> */}

      {/* <h1>Features</h1> */}
      {/* <FeatureItem icon={<MdPalette />} title="Upload and Draw">
        Drop in images and <strong>just draw</strong>. Without ads, clutter or
        endless rearranging.
      </FeatureItem>
      <FeatureItem icon={<MdImage />} title="Make it yours">
        Rearrange blocks <span className="font-bold">however you want</span>,
        group them, label them...or don&apos;t! The board is yours.
      </FeatureItem>
      <FeatureItem icon={<FaCloud />} title="Sync Online">
        Everything saves automatically, so you can{" "}
        <strong>open anywhere</strong> and pick up where you left off.
      </FeatureItem>

      <FeatureItem
        title="Split Screen"
        icon={<TbLayoutSidebarFilled className="size-4.5" />}
      >
        Keep one image open while browsing the rest. It’s like having a{" "}
        <strong>built in second screen</strong>.
      </FeatureItem>
      <FeatureItem
        title="Reusable Sections"
        icon={<FaBook className="size-3.5" />}
      >
        Don&apos;t rebuild your reference library.{" "}
        <strong>Build a section once</strong>, then drop it into any board.
      </FeatureItem>
      <FeatureItem icon={<FaPaperPlane />} title="So Sharable">
        All boards have a sharable link. <strong>Send to clients</strong>,
        classmates, or your future self.
      </FeatureItem> */}
    </>
  );
}
