import { useEffect } from "react";
import { useLayoutStore } from "@/store/layout-store";
import { useLoadingStore } from "@/store/loading-store";
import { MOBILE_BREAKPOINT } from "@/types/constants";

export function useMobileColumnResizeEffect(sectionIds: string[]) {
  const setWindowWidth = useLayoutStore((s) => s.setWindowWidth);
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
      const { forceMobileColumns, toggleMobileColumns } =
        useLayoutStore.getState();

      if (isMobile && !forceMobileColumns) {
        toggleMobileColumns();
      } else if (!isMobile && forceMobileColumns) {
        toggleMobileColumns();
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
