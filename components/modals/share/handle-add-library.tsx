import { supabase } from "@/lib/supabase/supabase-client";
import { useDemoStore } from "@/store/demo-store";
import { useExploreStore } from "@/store/explore-store";
import { usePanelStore } from "@/store/panel-store";
import { Section } from "@/types/board-types";
import { SectionWithStats } from "@/types/stat-types";

export async function handleLibrarySync(
  section: Section,
  isPublished: boolean,
  isDemo: boolean
) {
  if (isDemo) {
    // tutorial specific
    useDemoStore.getState().markMissionComplete("mudkit");
    useExploreStore.getState().setExploreMode("search");
    usePanelStore.getState().setPanelMode("explore");

    const { tempMudkits, setTempMudkits } = useExploreStore.getState();

    if (isPublished) {
      // useDemoStore.getState().fireConfetti();

      // Prevent duplicate entries
      const alreadyExists = tempMudkits.some(
        (s) => s.section_id === section.section_id
      );
      if (!alreadyExists) {
        const mudkit: SectionWithStats = {
          ...section,
        };
        setTempMudkits([...tempMudkits, mudkit]);
      }
    } else {
      // Remove the section from tempMudkits
      const filtered = tempMudkits.filter(
        (s) => s.section_id !== section.section_id
      );
      setTempMudkits(filtered);
    }
  } else {
    if (isPublished) {
      try {
        // we need to grab the stats from supabase
        const { data, error } = await supabase
          .from("section_with_stats")
          .select("*")
          .eq("section_id", section.section_id)
          .single();

        if (error || !data) {
          console.error("Failed to fetch published section with stats:", error);
          return;
        }

        const existing = useExploreStore
          .getState()
          .userMudkits.some((s) => s.section_id === data.section_id);

        if (!existing) {
          const newMudkits = [
            ...useExploreStore.getState().userMudkits,
            data as SectionWithStats,
          ];
          useExploreStore.getState().setUserMudkits(newMudkits);
        }
      } catch (err) {
        console.error("Unexpected error while updating user section:", err);
      }
    } else {
      // remove from userMudkits if unpublishing
      const filtered = useExploreStore
        .getState()
        .userMudkits.filter((s) => s.section_id !== section.section_id);
      useExploreStore.getState().setUserMudkits(filtered);
    }
  }
}
