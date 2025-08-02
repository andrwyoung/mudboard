import { useState } from "react";
import { useDemoStore } from "@/store/demo-store";
import { TUTORIAL_TITLE } from "@/types/constants";
import { ChevronDown, ChevronUp } from "lucide-react"; // or any icon set you’re using
import { FaCaretDown } from "react-icons/fa6";
import DemoHelpModal from "./demo-help-modal";
import { useUIStore } from "@/store/ui-store";
import { scrollToSelectedSection } from "@/lib/sidebar/scroll-to-selected-section";
import { usePanelStore } from "@/store/panel-store";
import {
  essentialItems,
  extraItems,
  MissionType,
  TutorialRowType,
} from "@/types/demo-types";

function TutorialRow({ item }: { item: TutorialRowType }) {
  const completed = useDemoStore((s) => s.missionsCompleted[item.mission]);
  const openHelp = useDemoStore((s) => s.openHelp);

  const missionsWithTips: MissionType[] = [
    "greenhouse",
    "mudkit",
    // "upload",
    "spotlight",
    "export",
  ];

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2">
        <div
          className={`mt-1 flex-none w-3 h-3 rounded-full border-2 border-primary ${
            completed ? "bg-accent" : ""
          }`}
        />
        <span
          className={`text-sm ${
            completed
              ? "line-through text-muted-foreground align-[0.4em]"
              : "text-primary"
          }`}
        >
          {item.text}
        </span>
      </div>
      {missionsWithTips.includes(item.mission) && (
        <button
          type="button"
          className="text-xs underline text-primary hover:text-accent cursor-pointer"
          onClick={() => {
            openHelp(item.mission);
            if (item.mission === "mudkit") {
              useUIStore.getState().setFreeformMode(false);
              usePanelStore.getState().setPanelMode("none");
              scrollToSelectedSection();
            }
          }}
        >
          Guide
        </button>
      )}
    </div>
  );
}

export default function TutorialPanel() {
  const isDemo = useDemoStore((s) => s.isDemoBoard);
  const [isOpen, setIsOpen] = useState(true);
  const [showExtras, setShowExtras] = useState(false);

  const missionsCompleted = useDemoStore((s) => s.missionsCompleted);

  if (!isDemo) return null;

  return (
    <>
      <div
        className="hidden sm:block absolute right-6 bottom-4 
      w-64 bg-background shadow-lg z-50 rounded-sm overflow-hidden"
      >
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer text-primary border-b"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h1 className="font-semibold">{TUTORIAL_TITLE}</h1>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {isOpen && (
          <>
            <div className="px-4 py-2 text-sm text-muted-foreground space-y-2">
              {essentialItems.map((item, i) => (
                <TutorialRow key={i} item={item} />
              ))}
              {missionsCompleted.mudkit && (
                <TutorialRow
                  item={{
                    text: "(Final Boss) Use an image from the section you just saved",
                    mission: "mudkit2",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col px-4 py-2">
              <button
                type="button"
                className="font-header text-primary mb-2 text-sm font-semibold
              flex items-center gap-1 hover:opacity-80 cursor-pointer "
                onClick={() => setShowExtras((prev) => !prev)}
              >
                Extra Credit
                <FaCaretDown
                  className={`transition-transform duration-200 ${
                    showExtras ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showExtras && (
                <div className="mb-2 flex flex-col">
                  <div className="text-sm text-muted-foreground space-y-2 mb-1">
                    {extraItems.map((item, i) => (
                      <TutorialRow key={i} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <DemoHelpModal />
    </>
  );
}
