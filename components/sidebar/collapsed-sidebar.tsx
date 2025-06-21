// not to be confused with sidebar.tsx
// this is just the minimized sidebar component

import Image from "next/image";
import Link from "next/link";
import { CollapseArrow } from "../ui/sidebar/collapse-arrow";
import { FaImage } from "react-icons/fa6";
import { usePinnedStore } from "@/store/use-pinned-store";

export function CollapsedSidebar({ onExpand }: { onExpand: () => void }) {
  const togglePinnedView = usePinnedStore((s) => s.toggleOpen);
  const pinnedViewOpen = usePinnedStore((s) => s.isOpen);

  return (
    <div className="h-full flex flex-col items-center justify-start pt-2 gap-4">
      <Link href="/" className="w-[48px] h-[48px]" title="Home">
        <Image
          src={"/logo.png"}
          alt={"Small Mudboard Logo"}
          width={350}
          height={350}
          draggable={false}
        />
      </Link>
      <CollapseArrow left onClick={onExpand} />
      {/* <button
        type="button"
        className="flex items-center gap-1 cursor-pointer group"
        onClick={toggleMirrorMode}
        title="Toggle Split Screen"
      >
        <MdViewColumn
          className={`hover:text-accent hover:scale-110 transition-all duration-200 
            size-6 ${mirrorMode ? "text-accent" : "text-white"}`}
        />
      </button> */}

      <button
        type="button"
        className="flex items-center gap-1 cursor-pointer group"
        onClick={togglePinnedView}
        title="Toggle Expanded Image"
      >
        <FaImage
          className={`hover:text-accent hover:scale-110 transition-all duration-200 
            size-5 ${pinnedViewOpen ? "text-accent" : "text-white"}`}
        />
      </button>
    </div>
  );
}
