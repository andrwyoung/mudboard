import React from "react";
import { FaCloud } from "react-icons/fa";
import { MdPalette, MdImage } from "react-icons/md";

type FeatureItemProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function FeatureItem({ title, icon, children }: FeatureItemProps) {
  return (
    <div>
      <div className="flex gap-2 items-center mb-2">
        {icon && <span className="translate-y-[1px]">{icon}</span>}
        <h2 className="font-semibold text-xl">{title}</h2>
      </div>
      <p className="leading-relaxed text-sm">{children}</p>
    </div>
  );
}

export default function Features() {
  return (
    <>
      {/* <h1>Features</h1> */}
      <FeatureItem icon={<MdPalette />} title="Built for Creatives">
        Just upload your images and then view them. No endless repositioning. No
        ads and clutter.
      </FeatureItem>
      <FeatureItem icon={<MdImage />} title="Fully Customizable">
        Rearrange blocks however you want. Group by section. Add descriptions
        and captions.
      </FeatureItem>
      <FeatureItem icon={<FaCloud />} title="Access anywhere">
        Create your monster reference library and then share/view it anywhere.
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
