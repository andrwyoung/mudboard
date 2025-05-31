// this component is everything inside the "customize" dropdown
// this is the "mirror mode" button and the slider to change column number
// I really do need to come up with a better name for it

import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS } from "@/types/constants";
import { MirrorModeToggle } from "../ui/sidebar/mirror-toggle";

export default function CustomizeSection() {
  const setNumCols = useUIStore((s) => s.setNumCols);
  const numCols = useUIStore((s) => s.numCols);

  return (
    <div className=" flex flex-col gap-4 ">
      <MirrorModeToggle />

      <div className="flex flex-col gap-1 self-center w-full">
        {/* <div className="flex flex-col gap-1 max-w-42 self-center w-full"> */}
        <h3 className="text-xs font-semibold">Columns:</h3>

        {/* <div className="flex flex-row justify-between px-1 items-center gap-3 text-sm font-bold">
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
        </div> */}
        <div>
          <div className="flex justify-center py-1">
            {Array.from({ length: MAX_COLUMNS }, (_, i) => {
              const col = i + 1;
              const isActive = numCols > col;
              const isPicked = numCols === col;

              return (
                <button
                  key={col}
                  className={`flex flex-col group cursor-pointer p-1`}
                  onClick={() => {
                    setNumCols(col);
                  }}
                  aria-label={`Set columns to ${col}`}
                  title={`Set columns to ${col}`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 
                      ${
                        isPicked
                          ? "scale-125 bg-accent border-accent"
                          : isActive
                          ? "border-primary bg-accent group-hover:border-accent"
                          : "bg-white group-hover:bg-accent border-primary "
                      } `}
                  />
                  {isPicked && (
                    <p className="font-header text-xs font-bold mt-1">
                      {i + 1}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
