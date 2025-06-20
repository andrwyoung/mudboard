import InfoTooltip from "../ui/info-tooltip";
import { MudboardImage } from "@/types/block-types";
import PinnedImageViewer from "./pinned-image";
import { usePinnedStore } from "@/store/use-pinned-store";
import { useRef, useState } from "react";
import { useGetInitialSizeOnLayout } from "@/hooks/overlay-gallery.tsx/use-get-initial-size";
import { FaXmark } from "react-icons/fa6";

export default function PinnedPanel() {
  const pinnedBlock = usePinnedStore((s) => s.pinnedBlock);

  const setPinnedPanelOpen = usePinnedStore((s) => s.setIsOpen);
  const setPinnedBlock = usePinnedStore((s) => s.setPinnedBlock);

  const image = pinnedBlock?.data as MudboardImage;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // calculate size on mount
  useGetInitialSizeOnLayout(scrollRef, pinnedBlock, setInitialSize);

  return (
    <div className="flex flex-col h-full w-full bg-overlay-background text-white overflow-auto relative">
      <div className="top-4 left-4 flex flex-row gap-2 items-center absolute z-100">
        <h1 className="text-sm text-white font-header translate-y-[1px]">
          Focus View
        </h1>
        <InfoTooltip
          text="Click to drag around. Scroll to zoom. You can also resize this window. More features to come!"
          white
        />
      </div>

      <div
        className={`absolute top-4 right-4  
         cursor-pointer text-lg z-100`}
        onClick={() => {
          setPinnedBlock(null);
          setPinnedPanelOpen(false);
        }}
      >
        <FaXmark />
      </div>

      {pinnedBlock && image ? (
        <div
          className="absolute inset-0 overflow-auto 
           scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-background scrollbar-track-transparent"
          ref={scrollRef}
        >
          {initialSize && scrollRef.current && (
            <PinnedImageViewer
              block={pinnedBlock}
              image={image}
              key={pinnedBlock.block_id}
              scrollRef={scrollRef}
              initialSize={initialSize}
            />
          )}
        </div>
      ) : (
        <div
          className="absolute inset-0 flex justify-center
        text-center items-center font-header text-xl px-12"
        >
          <h1 className="max-w-sm">
            Drop an image from the gallery to focus it here!
          </h1>
        </div>
      )}
    </div>
  );
}
