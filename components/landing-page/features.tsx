// landing page stuff

import React from "react";
import { FaBook, FaCloud, FaPaperPlane } from "react-icons/fa";
import { MdPalette, MdImage } from "react-icons/md";
import { TbLayoutSidebarFilled } from "react-icons/tb";

type FeatureItemProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function FeatureItem({ title, icon, children }: FeatureItemProps) {
  return (
    <div>
      <div className="flex gap-2 items-center mb-2">
        <div className="text-accent">{icon}</div>
        <h2 className="font-semibold text-xl">{title}</h2>
      </div>
      <p className="leading-relaxed text-[0.9375rem]">{children}</p>
    </div>
  );
}

export default function Features() {
  return (
    <>
      {/* <h1>Features</h1> */}
      <FeatureItem icon={<MdPalette />} title="Upload and Draw">
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
      </FeatureItem>
    </>
  );
}
