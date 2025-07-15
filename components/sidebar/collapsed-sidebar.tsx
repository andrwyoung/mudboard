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
    <div className="h-full flex flex-col items-center justify-start pt-2">
      <Link href="/" className="w-[32px] h-[32px] mb-16" title="Home">
        <Image
          src={"/logo.png"}
          alt={"Small Mudboard Logo"}
          width={350}
          height={350}
          draggable={false}
        />
      </Link>

      <div className="flex flex-col items-center gap-4">
        <CollapseArrow left onClick={onExpand} />

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
    </div>
  );
}
