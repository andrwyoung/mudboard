import { OFFSHORE_THUMBNAIL_GEN_URL } from "@/types/upload-settings";
import { create } from "zustand";

type ThumbnailStore = {
  dashThumbnailUrl: string | null;
  extThumbnailUrl: string | null;

  generateThumbnail: (boardId: string) => Promise<void>;
};

export const useThumbnailStore = create<ThumbnailStore>((set, get) => ({
  dashThumbnailUrl: null,
  extThumbnailUrl: null,

  generateThumbnail: async (boardId: string) => {
    set({
      dashThumbnailUrl: null,
      extThumbnailUrl: null,
    });

    try {
      const res = await fetch(OFFSHORE_THUMBNAIL_GEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relevantId: boardId,
          exportType: "thumbnails",
        }),
      });

      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
      const result = await res.json();
      const { dashboard, external } = result.thumbnails ?? {};

      set({
        dashThumbnailUrl: dashboard ?? null,
        extThumbnailUrl: external ?? null,
      });

      console.log("Thumbnail generation response: ", result);
    } catch (err) {
      console.error("Failed to generate thumbnail via offshore API", err);
    }
  },
}));
