import { usePanelStore } from "@/store/panel-store";
import { FaXmark } from "react-icons/fa6";

export default function ClosePanelButton() {
  const closePanel = usePanelStore((s) => s.closePanel);

  return (
    <button
      type="button"
      title="Close Sidepanel"
      aria-label="Close side panel"
      className="absolute top-4 right-4 text-lg z-100 
      cursor-pointer focus:outline-none focus-visible:ring-2
      focus-visible:ring-ring"
      onClick={closePanel}
    >
      <FaXmark />
    </button>
  );
}
