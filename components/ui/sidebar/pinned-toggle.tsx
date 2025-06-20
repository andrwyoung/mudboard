import { useSidebarStore } from "@/store/sidebar-store";
import { usePinnedStore } from "@/store/use-pinned-store";
import { FaImage } from "react-icons/fa";

export function PinnedModeToggle({ showText = true }: { showText?: boolean }) {
  const pinnedViewOpen = usePinnedStore((s) => s.isOpen);
  const setPinnedViewOpen = usePinnedStore((s) => s.setIsOpen);
  const setPinnedBlock = usePinnedStore((s) => s.setPinnedBlock);

  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const setSidebarCollapsed = useSidebarStore((s) => s.setIsCollapsed);

  const handleToggleFocusView = () => {
    if (pinnedViewOpen) {
      // Exiting Focus View — close and clear pinned image
      setPinnedViewOpen(false);
      setPinnedBlock(null);
    } else {
      // Entering Focus View — open and collapse sidebar if not already
      setPinnedViewOpen(true);
      if (!isSidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    }
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 
        ${pinnedViewOpen ? "text-accent" : "text-white hover:text-accent"}`}
      onClick={handleToggleFocusView}
    >
      <FaImage className="" />
      {showText && (
        <h3 className={`group-hover:underline`} title="Toggle Focus View">
          Spotlight View
        </h3>
      )}
    </button>
  );
}
