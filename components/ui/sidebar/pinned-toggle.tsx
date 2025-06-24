import { PanelMode, usePanelStore } from "@/store/panel-store";
import { FaImage } from "react-icons/fa";
import { FaLeaf } from "react-icons/fa6";

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
      className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 px-2 rounded-sm
        py-0.5 ${
          isActive ? "bg-accent text-primary" : "text-white hover:text-accent"
        }`}
      onClick={() => {
        setPanelMode(isActive ? "none" : mode);
      }}
      title={title}
    >
      {icon}
      <span className="group-hover:underline font-header">{label}</span>
    </button>
  );
}

export function PinnedModeToggle({ showText = true }: { showText?: boolean }) {
  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);

  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Side panel:</h3>
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
              icon={<FaLeaf />}
              label="Greenhouse"
              title="Toggle Explore View"
            />
          </>
        )}
      </div>
    </div>
  );
}
