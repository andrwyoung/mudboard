import { supabase } from "@/utils/supabase";
import { Section } from "@/types/board-types";
import { useMetadataStore } from "@/store/metadata-store";

// Assumes both sections are on the same board
export async function swapSectionOrder(a: Section, b: Section) {
  if (a.order_index === b.order_index) return;

  const { error: errorA } = await supabase
    .from("sections")
    .update({ order_index: b.order_index })
    .eq("section_id", a.section_id);

  const { error: errorB } = await supabase
    .from("sections")
    .update({ order_index: a.order_index })
    .eq("section_id", b.section_id);

  if (errorA || errorB) {
    console.error("Failed to swap section order:", errorA || errorB);
    return false;
  }

  // Update locally
  useMetadataStore.setState((s) => {
    const newSections = [...s.sections].map((sec) => {
      if (sec.section_id === a.section_id)
        return { ...sec, order_index: b.order_index };
      if (sec.section_id === b.section_id)
        return { ...sec, order_index: a.order_index };
      return sec;
    });

    return {
      sections: newSections,
    };
  });

  return true;
}
