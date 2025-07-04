// DATABASE FETCH

import { SectionWithStats } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export default async function fetchMudkits(userId?: string): Promise<{
  userMudkits: SectionWithStats[];
  otherMudkits: SectionWithStats[];
}> {
  let userMudkits: SectionWithStats[] = [];
  let myMudkitsError = null;

  // Only fetch userMudkits if we have a userId
  if (userId) {
    const { data, error } = await supabase
      .from("section_with_stats")
      .select("*")
      .eq("is_public", true)
      .eq("owned_by", userId);

    userMudkits = data ?? [];
    myMudkitsError = error;
  }

  // always fetch the otherMudkits
  let otherQuery = supabase
    .from("section_with_stats")
    .select("*")
    .eq("is_public", true)
    .eq("is_on_marketplace", true)
    .not("owned_by", "is", null);

  if (userId) {
    otherQuery = otherQuery.neq("owned_by", userId);
  }
  const { data: otherMudkits, error: otherMudkitsError } = await otherQuery;

  if (myMudkitsError || otherMudkitsError) {
    console.error(
      "Error fetching mudkits:",
      myMudkitsError || otherMudkitsError
    );
    return { userMudkits: [], otherMudkits: [] };
  }

  return {
    userMudkits,
    otherMudkits: otherMudkits ?? [],
  };
}
