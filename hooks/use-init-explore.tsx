import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { useEffect } from "react";

export function useInitExplore() {
  const user = useMetadataStore((s) => s.user);
  const { fetchMudkits, fetchUserBoards } = useExploreStore();

  useEffect(() => {
    const fetch = async () => {
      await fetchMudkits(user?.id);

      if (user?.id) {
        await fetchUserBoards(user.id);
      }
    };

    fetch();
  }, [user]);
}
