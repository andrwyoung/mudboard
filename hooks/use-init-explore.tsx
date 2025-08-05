import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { useEffect } from "react";

export function useInitExplore() {
  const user = useMetadataStore((s) => s.user);
  const { fetchMudkits, fetchAndGroupUserBoards } = useExploreStore();

  useEffect(() => {
    const fetch = async () => {
      await fetchMudkits(user?.id);

      if (user?.id) {
        await fetchAndGroupUserBoards(user.id);
      }
    };

    fetch();
  }, [user]);
}
