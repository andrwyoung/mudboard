import { supabase } from "@/lib/supabase";
import { hasWriteAccess } from "../db-actions/check-write-access";
import { useLayoutStore } from "@/store/layout-store";
import { Block, MudboardImage } from "@/types/block-types";

export async function updateImageBlockCaption(
  block: Block,
  newCaption: string | null
) {
  const canWrite = await hasWriteAccess();

  if (!canWrite) {
    console.warn("Not syncing block caption");
    return;
  }

  if (block.block_type !== "image") {
    console.warn("trying to change caption for a non image");
    return;
  }

  const image = block.data as MudboardImage;

  // update locally
  const newData = {
    ...image,
    caption: newCaption,
  } as MudboardImage;

  useLayoutStore.setState((s) => ({
    sectionColumns: {
      ...s.sectionColumns,
      [block.section_id]: s.sectionColumns[block.section_id].map((column) =>
        column.map((b) =>
          b.block_id === block.block_id ? { ...b, data: newData } : b
        )
      ),
    },
  }));

  // update remotely
  await supabase
    .from("images")
    .update({ caption: newCaption })
    .eq("image_id", image.image_id);
}
