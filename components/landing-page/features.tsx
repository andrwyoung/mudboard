import React from "react";
import { FaCloud } from "react-icons/fa";
import { MdPalette, MdImage } from "react-icons/md";
import FillingDot from "../ui/filling-dot";

type FeatureItemProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function FeatureItem({ title, icon, children }: FeatureItemProps) {
  return (
    <div>
      <div className="flex gap-2 items-center mb-2">
        {icon && <FillingDot />}
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
      <FeatureItem icon={<MdPalette />} title="Just let me draw">
        Just upload your images and then view them.{" "}
        <span className="font-bold">No ads, no clutter</span>. Add a new image
        without breaking your flow, or your whole layout.
      </FeatureItem>
      <FeatureItem icon={<MdImage />} title="Make it yours">
        Just because it&apos;s quick doesn&apos;t mean it&apos;s not
        customizable. Rearrange blocks{" "}
        <span className="font-bold">however you want</span>. Group by section.
        Add descriptions and captions.
      </FeatureItem>
      <FeatureItem icon={<FaCloud />} title="Reference Anywhere">
        Create your monster reference library and then{" "}
        <span className="font-bold">share/view it anywhere</span>. No need to
        export your moodboard as a png to share now.
      </FeatureItem>

      {/* <FeatureItem title="Built in Timed Draws">
          Upload thousands of images (just...not all at once), and come back to
          it anytime.
        </FeatureItem>
        <FeatureItem title="Mirror Mode">
          Focus on an image while looking through other photos.
        </FeatureItem> */}
    </>
  );
}
