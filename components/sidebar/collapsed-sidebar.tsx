// not to be confused with sidebar.tsx
// this is just the minimized sidebar component

import Image from "next/image";
import Link from "next/link";
import { CollapseArrow } from "../ui/sidebar/collapse-arrow";
import { FaHome } from "react-icons/fa";
import { DASHBOARD_LINK } from "@/types/constants";
import { WorkspaceToggles } from "../ui/sidebar/workspace-toggle";
import { RefObject } from "react";
import CollapsedSectionSections from "./collapsed-sections/collapsed-section-sections";

const iconClassname =
  "hover:text-accent hover:scale-110 transition-all duration-200 text-primary-text";

export function CollapsedSidebar({
  onExpand,
  sectionRefs,
}: {
  onExpand: () => void;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-between">
      <div className="flex flex-col pt-2 gap-2 items-center">
        <Link href="/" className="w-[32px] h-[32px]" title="Home">
          <Image
            src={"/logo.png"}
            alt={"Small Mudboard Logo"}
            width={350}
            height={350}
            draggable={false}
          />
        </Link>
        <CollapseArrow left onClick={onExpand} />
      </div>

      <div className="flex flex-col items-center gap-12">
        <CollapsedSectionSections sectionRefs={sectionRefs} />

        <div className="flex flex-col items-center gap-2">
          <WorkspaceToggles collapsed={true} />
        </div>
      </div>

      <div className="mb-4">
        <Link
          title="Dashboard"
          href={DASHBOARD_LINK}
          className={`${iconClassname}`}
        >
          <FaHome className="size-5.5" />
        </Link>
      </div>
    </div>
  );
}
