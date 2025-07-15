// deciding whether to collapse everything into 2 columns

import { useEffect } from "react";
import { useLayoutStore } from "@/store/layout-store";
import { useLoadingStore } from "@/store/loading-store";
import { MOBILE_BREAKPOINT } from "@/types/constants";
import { useMeasureStore, useUIStore } from "@/store/ui-store";

export function useMobileColumnResizeEffect(sectionIds: string[]) {
  const setWindowWidth = useMeasureStore((s) => s.setWindowWidth);
  const setShowBlurImg = useLoadingStore((s) => s.setShowBlurImg);

  useEffect(() => {
    const width = window.innerWidth;
    setWindowWidth(width); // grab window size on init
  }, [setWindowWidth]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      setShowBlurImg(true);
      const width = window.innerWidth;
      setWindowWidth(width);

      const isMobile = width < MOBILE_BREAKPOINT;
      const regenerateAllSections =
        useLayoutStore.getState().regenerateAllSections;
      const { forceMobileColumns, setMobileColumns } = useUIStore.getState();

      if (isMobile !== forceMobileColumns) {
        setMobileColumns(isMobile);
        regenerateAllSections();
      }

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowBlurImg(false);
      }, 400);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeout) clearTimeout(timeout);
    };
  }, [sectionIds, setWindowWidth, setShowBlurImg]);
}
