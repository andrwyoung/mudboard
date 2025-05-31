import Image from "next/image";
import Link from "next/link";
import { CollapseArrow } from "../ui/sidebar/collapse-arrow";
import { FiSidebar } from "react-icons/fi";
import { useUIStore } from "@/store/ui-store";

export function CollapsedSidebar({ onExpand }: { onExpand: () => void }) {
  const toggleMirrorMode = useUIStore((s) => s.toggleMirrorMode);
  const mirrorMode = useUIStore((s) => s.mirrorMode);

  return (
    <div className="h-full flex flex-col items-center justify-start pt-2 gap-4">
      <Link href="/" className="w-[48px] h-[48px]" title="Home">
        <Image
          src={"/logo.png"}
          alt={"Small Mudboard Logo"}
          width={350}
          height={350}
        />
      </Link>
      <CollapseArrow left onClick={onExpand} />
      <button
        type="button"
        className="flex items-center gap-1 cursor-pointer group"
        onClick={toggleMirrorMode}
        title="Toggle Mirror Mode"
      >
        <FiSidebar
          className={`hover:text-accent hover:scale-110 transition-all duration-200 
            size-5.5 ${mirrorMode ? "text-accent" : "text-white"}`}
        />
      </button>
    </div>
  );
}
