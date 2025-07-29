// DEPRECATED for workspace-toggle.tsx

import { useDemoStore } from "@/store/demo-store";
import { PanelMode, usePanelStore } from "@/store/panel-store";
import { FaImage } from "react-icons/fa";
import { FaBook } from "react-icons/fa6";

export function PanelToggleButton({
  mode,
  icon,
  label,
  title,
}: {
  mode: PanelMode;
  icon: React.ReactNode;
  label: string;
  title?: string;
}) {
  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);

  const isActive = panelMode === mode;

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group px-2 rounded-sm
        py-0.5 hover:outline hover:outline-accent ${
          isActive
            ? "bg-accent text-primary hover:bg-accent/70"
            : "text-white hover:bg-accent/40"
        }`}
      onClick={() => {
        const nextMode = isActive ? "none" : mode;
        setPanelMode(nextMode);

        // trigger Demo modal if explore mode
        // openModal checks internally whether it should open
        if (nextMode === "explore") {
          useDemoStore.getState().openModal("greenhouse");
        }
      }}
      title={title}
    >
      {icon}
      <span className="font-header">{label}</span>
    </button>
  );
}

export function PinnedModeToggle({ showText = true }: { showText?: boolean }) {
  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);

  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold">Side panel:</h3>
        {
          <button
            type="button"
            className={`text-sm  hover:text-accent hover:underline font-semibold
          transition-all duration-200 ${
            panelMode === "none"
              ? "opacity-0"
              : "opacity-75 hover:opacity-100 cursor-pointer"
          }
          `}
            onClick={() => setPanelMode("none")}
          >
            Close
          </button>
        }
      </div>
      <div className="flex flex-col my-1 ">
        {showText && (
          <>
            <PanelToggleButton
              mode="focus"
              icon={<FaImage />}
              label="Spotlight"
              title="Toggle Focus View"
            />
            <PanelToggleButton
              mode="explore"
              icon={<FaBook />}
              label="Libary"
              title="Toggle Explore View"
            />
          </>
        )}
      </div>
    </div>
  );
}
