// not to be confused with sidebar.tsx
// this is just the minimized sidebar component

import Image from "next/image";
import Link from "next/link";
import { CollapseArrow } from "../ui/sidebar/collapse-arrow";
import { FaImage, FaLeaf } from "react-icons/fa6";
import { usePanelStore } from "@/store/panel-store";
import { FaWindowClose } from "react-icons/fa";

const iconClassname =
  "hover:text-accent hover:scale-110 transition-all duration-200 text-white";

export function CollapsedSidebar({ onExpand }: { onExpand: () => void }) {
  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);

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

      {panelMode === "none" && (
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setPanelMode("focus")}
          title="Toggle to Focus Mode"
        >
          <FaImage className={`size-5 ${iconClassname}`} />
        </button>
      )}

      {panelMode === "focus" && (
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setPanelMode("explore")}
          title="Toggle to Explore Mode"
        >
          <FaLeaf className={`size-5 ${iconClassname}`} />
        </button>
      )}

      {panelMode === "explore" && (
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setPanelMode("none")}
          title="Close Side Panel"
        >
          <FaWindowClose className={`size-5 ${iconClassname}`} />
        </button>
      )}
    </div>
  );
}
