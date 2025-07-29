import { usePanelStore } from "@/store/panel-store";
import { useUIStore } from "@/store/ui-store";
import { FaVectorSquare } from "react-icons/fa6";
import { IoLibrary } from "react-icons/io5";
function WorkspaceToggleButton({
  icon,
  label,
  title,
  onClick,
  isActive,
  collapsed,
}: {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  onClick: () => void;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group rounded-sm
           hover:outline hover:outline-accent 
          ${collapsed ? "p-1 text-xl" : "px-2 py-0.5"}
          ${
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
      {label && <span className="font-header">{label}</span>}
    </button>
  );
}

export function WorkspaceToggles({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const freeformOn = useUIStore((s) => s.freeformMode);
  const setFreeformMode = useUIStore((s) => s.setFreeformMode);

  const panelMode = usePanelStore((s) => s.panelMode);
  const setPanelMode = usePanelStore((s) => s.setPanelMode);
  const greenhouseOpen = panelMode === "explore";

  return (
    <>
      <WorkspaceToggleButton
        icon={<FaVectorSquare />}
        label={!collapsed ? "Freeform" : undefined}
        title={freeformOn ? "Switch to Grid View" : "Switch to Freeform Canvas"}
        onClick={() => {
          if (freeformOn) {
            setFreeformMode(false);
          } else {
            setFreeformMode(true);
            // setPanelMode("none");
          }
        }}
        isActive={freeformOn}
        collapsed={collapsed}
      />
      <WorkspaceToggleButton
        icon={<IoLibrary />}
        label={!collapsed ? "Library" : undefined}
        title={greenhouseOpen ? "Close Library" : "Open Library"}
        onClick={() => {
          if (greenhouseOpen) {
            setPanelMode("none");
          } else {
            // setFreeformMode(false);
            setPanelMode("explore");
          }
        }}
        isActive={greenhouseOpen}
        collapsed={collapsed}
      />
    </>
  );
}
