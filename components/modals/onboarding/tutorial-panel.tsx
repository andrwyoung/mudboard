import { useState } from "react";
import { MissionType, useDemoStore } from "@/store/demo-store";
import { TUTORIAL_TITLE } from "@/types/constants";
import { ChevronDown, ChevronUp } from "lucide-react"; // or any icon set you’re using
import { FaCaretDown, FaLeaf } from "react-icons/fa6";
import DemoHelpModal from "./demo-help-modal";
import { BeanIcon } from "@/components/ui/bean-icon";
import { FaFileDownload } from "react-icons/fa";

type TutorialRowType = {
  text: React.ReactNode;
  mission: MissionType;
};

const essentialItems: TutorialRowType[] = [
  { text: "Drag around an image", mission: "drag" },
  {
    text: (
      <>
        Drag an Image from the Greenhouse{" "}
        <FaLeaf className="inline -translate-y-[2px] ml-0.5 opacity-75" />
      </>
    ),
    mission: "greenhouse",
  },
  {
    text: (
      <>
        Create a Mudkit{" "}
        <BeanIcon
          className="inline -translate-y-[2px] ml-0.5
        size-3 opacity-75"
        />
      </>
    ),
    mission: "mudkit",
  },
];

const extraItems: TutorialRowType[] = [
  {
    text: (
      <div className="flex flex-col">
        <span>Upload an Image</span>{" "}
        <span className="text-xs">(Pinterest might work too!)</span>
      </div>
    ),
    mission: "upload",
  },
  { text: "Spotlight an Image", mission: "spotlight" },
  {
    text: (
      <>
        Export a Section{" "}
        <FaFileDownload
          className="inline -translate-y-[2px] ml-0.5
          size-3 opacity-75"
        />
      </>
    ),
    mission: "export",
  },
];

function TutorialRow({ item }: { item: TutorialRowType }) {
  const completed = useDemoStore((s) => s.missionsCompleted[item.mission]);
  const openHelp = useDemoStore((s) => s.openHelp);

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
      <button
        className="text-xs underline text-primary hover:text-accent cursor-pointer"
        onClick={() => openHelp(item.mission)}
      >
        Tips
      </button>
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
                    text: "(Bonus) Reuse an Image from your Mudkit",
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
                Extras
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
                  {/* <div className="text-primary font-semibold text-xs self-center">
                  Article: 8 ways to Add Images
                </div> */}
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
