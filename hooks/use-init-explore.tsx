import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { useEffect } from "react";

export function useInitExplore() {
  const user = useMetadataStore((s) => s.user);
  const { fetchMudkits, fetchUserBoards } = useExploreStore();

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      await fetchMudkits(user.id);
      await fetchUserBoards(user.id);
    };

    fetch();
  }, [user]);
}
