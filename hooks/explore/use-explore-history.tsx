import { useEffect } from "react";
import { Section } from "@/types/board-types";
import { useExploreStore } from "@/store/explore-store";

export function useExploreHistory({
  selectedSection,
}: {
  selectedSection: Section | null;
}) {
  const setExploreMode = useExploreStore((s) => s.setExploreMode);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // User hit back, we assume they want to exit focus mode
      if (selectedSection) {
        setExploreMode("search");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedSection]);
}
