import { usePanelStore } from "@/store/panel-store";
import { useUIStore } from "@/store/ui-store";
import { FaLeaf, FaVectorSquare } from "react-icons/fa6";

function WorkspaceToggleButton({
  icon,
  label,
  title,
  onClick,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  title?: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group px-2 rounded-sm
          py-0.5 hover:outline hover:outline-accent ${
            isActive
              ? "bg-accent text-primary hover:bg-accent/70"
              : "text-white hover:bg-accent/40"
          }`}
      onClick={onClick}
      title={title}
      aria-pressed={isActive}
      aria-label={title || label}
    >
      {icon}
      <span className="font-header">{label}</span>
    </button>
  );
}

export function WorkspaceToggles() {
  const freeformOn = useUIStore((s) => s.freeformMode);
  const setFreeformMode = useUIStore((s) => s.setFreeformMode);

  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);
  const greenhouseOpen = panelMode === "explore";

  return (
    <div className="px-8 flex flex-col gap-1">
      <h3 className="text-sm ">Workspaces:</h3>
      <WorkspaceToggleButton
        icon={<FaVectorSquare />}
        label="Freeform"
        title={freeformOn ? "Switch to Grid View" : "Switch to Freeform Canvas"}
        onClick={() => {
          if (freeformOn) {
            setFreeformMode(false);
          } else {
            setFreeformMode(true);
            setPanelMode("none");
          }
        }}
        isActive={freeformOn}
      />
      <WorkspaceToggleButton
        icon={<FaLeaf />}
        label="Greenhouse"
        title={greenhouseOpen ? "Close Greenhouse" : "Open Greenhouse"}
        onClick={() => {
          if (greenhouseOpen) {
            setPanelMode("none");
          } else {
            setFreeformMode(false);
            setPanelMode("explore");
          }
        }}
        isActive={greenhouseOpen}
      />
    </div>
  );
}
