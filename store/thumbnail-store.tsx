import { generateAndUploadThumbnailFromRef } from "@/lib/thumbnail/generate-canvas-thumbnail";
import { create } from "zustand";

type ThumbnailStore = {
  dashboardRef: React.RefObject<HTMLDivElement | null> | null;
  setDashboardRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
  externalRef: React.RefObject<HTMLDivElement | null> | null;
  setExternalRef: (ref: React.RefObject<HTMLDivElement | null>) => void;

  dashThumbnailUrl: string | null;
  setDashThumbnailUrl: (url: string | null) => void;
  extThumbnailUrl: string | null;
  setExtThumbnailUrl: (url: string | null) => void;

  generateThumbnail: (boardId: string) => Promise<void>;
};

export const useThumbnailStore = create<ThumbnailStore>((set, get) => ({
  dashboardRef: null,
  externalRef: null,

  setDashboardRef: (ref) => set({ dashboardRef: ref }),
  setExternalRef: (ref) => set({ externalRef: ref }),

  dashThumbnailUrl: null,
  extThumbnailUrl: null,

  setDashThumbnailUrl: (url) => set({ dashThumbnailUrl: url }),
  setExtThumbnailUrl: (url) => set({ extThumbnailUrl: url }),

  generateThumbnail: async (boardId) => {
    const {
      dashboardRef,
      externalRef,
      setDashThumbnailUrl,
      setExtThumbnailUrl,
    } = get();

    // Clear previous thumbnails
    setDashThumbnailUrl(null);
    setExtThumbnailUrl(null);

    if (!dashboardRef?.current || !externalRef?.current) {
      console.warn("Thumbnail refs not ready. Aborting generation.");
      return;
    }

    const extThumbnail = await generateAndUploadThumbnailFromRef({
      element: externalRef.current,
      boardId,
      thumbnailType: "board-thumb-ext",
    });

    const dashThumbnail = await generateAndUploadThumbnailFromRef({
      element: dashboardRef.current,
      boardId,
      thumbnailType: "board-thumb-dashboard",
    });

    setDashThumbnailUrl(dashThumbnail ?? null);
    setExtThumbnailUrl(extThumbnail ?? null);
  },
}));
