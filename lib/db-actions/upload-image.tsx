// this is the function that actually uploads images along with it's variants
// to supabase, then creates metadata in the images and blocks table

import { supabase } from "../supabase/supabase-client";
import {
  BlockDownload,
  BlockInsert,
  ImageInsert,
  MudboardImage,
} from "@/types/block-types";

export async function uploadImageToSupabase(
  file: File,
  block: BlockInsert,
  newImage: MudboardImage,
  fullImage?: File,
  thumbnailImage?: File
): Promise<string> {
  //
  // STEP 1
  // first upload the images to storage
  const folder = newImage.image_id;
  const uploads = [
    { name: `${folder}/medium.${newImage.file_ext}`, file },
    { name: `${folder}/full.${newImage.file_ext}`, file: fullImage },
    { name: `${folder}/thumb.${newImage.file_ext}`, file: thumbnailImage },
  ];

  for (const { name, file } of uploads) {
    if (!file) continue; // skip if optional
    const { error } = await supabase.storage
      .from("mudboard-photos")
      .upload(name, file);
    if (error) {
      throw new Error(`Upload failed for ${name}: ${error.message}`);
    }
  }

  //
  // STEP 2:
  // now insert metadata
  // note we're inserting everything except our user created fields:
  // fileName and uploadStatus
  const {
    image_id,
    file_ext,
    original_name,
    og_width,
    og_height,
    blurhash,
    uploaded_by,
  } = newImage;

  const payload: ImageInsert = {
    image_id,
    file_ext,
    original_name,
    og_width,
    og_height,
    blurhash,
    uploaded_by,
  };

  const { error: insertError } = await supabase.from("images").insert(payload);

  if (insertError) {
    throw new Error(`DB image insert failed: ${insertError.message}`);
  }

  //
  // STEP 3:
  // upload the block
  // note we're just inserting everything but data

  const blockPayload: BlockInsert = {
    ...block,
    image_id: image_id,
  };

  const { data, error: blockInsertError } = await supabase
    .from("blocks")
    .insert(blockPayload)
    .select()
    .single();

  if (blockInsertError) {
    throw new Error(
      `DB image block insert failed: ${blockInsertError.message}`
    );
  }

  console.log("Uploaded: ", file);

  // return the database's block_id so we can keep it around
  const databaseBlock = data as BlockDownload;
  return databaseBlock.block_id;
}
