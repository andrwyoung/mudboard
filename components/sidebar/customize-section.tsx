import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";
import React from "react";
import { Slider } from "../ui/slider";
import { useLoadingStore } from "@/store/loading-store";
import { FiSidebar } from "react-icons/fi";

export default function CustomizeSection() {
  const setNumCols = useUIStore((s) => s.setNumCols);
  const toggleMirrorMode = useUIStore((s) => s.toggleMirrorMode);
  const mirrorMode = useUIStore((s) => s.mirrorMode);
  const setShowBlurImg = useLoadingStore((s) => s.setShowBlurImg);

  const setShowLoading = useLoadingStore((s) => s.setShowLoading);
  const setFadeGallery = useLoadingStore((s) => s.setFadeGallery);
  const sliderVal = useLoadingStore((s) => s.sliderVal);
  const setSliderVal = useLoadingStore((s) => s.setSliderVal);

  return (
    <div className=" flex flex-col gap-4 ">
      <button
        type="button"
        className="flex items-center gap-1 cursor-pointer group"
        onClick={() => toggleMirrorMode()}
      >
        <FiSidebar className="text-accent" />
        <h3
          className={` transition-all duration-300 group-hover:underline  ${
            mirrorMode ? "text-accent" : "text-white group-hover:text-accent"
          }`}
        >
          Mirror Mode
        </h3>
      </button>

      <div className="flex flex-col gap-1 self-center w-full">
        {/* <div className="flex flex-col gap-1 max-w-42 self-center w-full"> */}
        <h3 className="mb-1 text-xs font-semibold">Columns:</h3>

        <div className="flex flex-row justify-between px-1 items-center gap-3 text-sm font-bold">
          <p className="font-bold">{MIN_COLUMNS}</p>
          <div
            className="w-full"
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
              // orientation="vertical"
            />
          </div>

          <p className="font-bold">{MAX_COLUMNS}</p>
        </div>
      </div>
    </div>
  );
}
