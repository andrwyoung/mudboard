import InfoTooltip from "../ui/info-tooltip";
import { MudboardImage } from "@/types/block-types";
import PinnedImageViewer from "./pinned-image";
import { usePanelStore } from "@/store/panel-store";
import { useRef, useState } from "react";
import { useGetInitialSizeOnLayout } from "@/hooks/overlay-gallery.tsx/use-get-initial-size";
import ClosePanelButton from "./close-panel-button";

export default function PinnedPanel() {
  const pinnedBlock = usePanelStore((s) => s.pinnedBlock);

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
          Spotlight View
        </h1>
        <InfoTooltip
          text="Click to drag. scroll to zoom. Edits here don’t change the gallery. More tools coming soon."
          white
        />
      </div>

      <ClosePanelButton />

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
