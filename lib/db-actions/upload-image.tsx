import { supabase } from "../supabase";
import {
  Block,
  BlockInsert,
  ImageInsert,
  MudboardImage,
} from "@/types/image-type";

export async function uploadImageToSupabase(
  file: File,
  block: Block,
  newImage: MudboardImage,
  fullImage?: File,
  thumbnailImage?: File
): Promise<ImageInsert> {
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
  const { image_id, file_ext, original_name, width, height, description } =
    newImage;

  const payload: ImageInsert = {
    image_id,
    file_ext,
    original_name,
    width,
    height,
    description,
  };

  const { error: insertError } = await supabase.from("images").insert(payload);

  if (insertError) {
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  //
  // STEP 3:
  // now create the block so we can access it
  const blockPayload: BlockInsert = { ...block };
  const { error: blockInsertError } = await supabase
    .from("blocks")
    .insert(blockPayload);

  if (blockInsertError) {
    throw new Error(`DB insert failed: ${blockInsertError.message}`);
  }

  console.log("Uploaded: ", file);

  return payload;
}
