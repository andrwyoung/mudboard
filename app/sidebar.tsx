import { Slider } from "@/components/ui/slider";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const fontClass = "font-semibold text-md font-header";
const refClass =
  "text-accent hover:text-primary-foreground transition-all hover:underline";

export default function Sidebar({
  sliderVal,
  setSliderVal,
  setFadeGallery,
  setShowLoading,
}: {
  sliderVal: number;
  setSliderVal: (e: number) => void;
  setFadeGallery: (e: boolean) => void;
  setShowLoading: (e: boolean) => void;
}) {
  const setShowBlurImg = useLayoutStore((s) => s.setShowBlurImg);
  const setNumCols = useUIStore((s) => s.setNumCols);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex justify-center py-8 px-4 ">
        <Link
          className="cursor-pointer hover:scale-105 transition-transform duration-300"
          href={"/"}
        >
          <Image
            src={"/full-logo-white.png"}
            alt="mudboard logo"
            height={387}
            width={1267}
            className="w-[200px]"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-grow justify-center px-10 gap-24">
        <div className="flex flex-col">
          <h1 className="text-3xl  font-bold">Art Room</h1>
          <p className="text-sm mb-12 font-semibold">
            Site&apos;s under construction, but uh feel free to drag around some
            pictures!
          </p>
          <div className="flex flex-col gap-2">
            <p className={`${fontClass}`}>
              •{" "}
              <a
                href="https://www.jonadrew.com/"
                target="_blank"
                rel="noreferrer"
                className={`${refClass} ${fontClass}`}
              >
                My Art Portfolio
              </a>
            </p>
            <p className={`${fontClass}`}>
              •{" "}
              <a
                href="https://blog.jonadrew.com/profile"
                target="_blank"
                rel="noreferrer"
                className={`${refClass} ${fontClass}`}
              >
                How this is being built
              </a>
            </p>
          </div>
        </div>
        <div
          onPointerDown={() => {
            setShowLoading(false);
            setShowBlurImg(true);
            setFadeGallery(true);
          }}
          onPointerUp={() => {
            // setFadeGallery(false);
            setShowLoading(true);
            setTimeout(() => {
              setNumCols(sliderVal);
              setFadeGallery(false);
              setTimeout(() => {
                setShowBlurImg(false);
              }, 400);
            }, 300); // small delay to let layout commit — tweak as needed
          }}
        >
          <Slider
            defaultValue={[sliderVal]}
            min={MIN_COLUMNS}
            max={MAX_COLUMNS}
            onValueChange={(val) => setSliderVal(val[0])}
            orientation="vertical"
          />
        </div>
      </div>
      <div
        className="flex flex-col items-center px-4 py-4 
      font-mono font-semibold mt-auto text-xs pt-12 text-primary-foreground"
      >
        &copy; {new Date().getFullYear()} Andrew Yong
      </div>
    </div>
  );
}
