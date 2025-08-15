// this it the "mirror mode button"
// I thought I would use it in multiple places....but it's only used once

import { FiSidebar } from "react-icons/fi";
import { useUIStore } from "@/store/ui-store";

export function MirrorModeToggle({ showText = true }: { showText?: boolean }) {
  const toggleMirrorMode = useUIStore((s) => s.toggleMirrorMode);
  const mirrorMode = useUIStore((s) => s.mirrorMode);

  return (
    <button
      type="button"
      className="flex items-center gap-1 cursor-pointer group"
      onClick={toggleMirrorMode}
    >
      <FiSidebar className="text-accent" />
      {showText && (
        <h3
          className={`transition-all duration-300 group-hover:underline ${
            mirrorMode
              ? "text-accent"
              : "text-off-white group-hover:text-accent"
          }`}
          title="Toggle Split Screen"
        >
          Split Screen
        </h3>
      )}
    </button>
  );
}
