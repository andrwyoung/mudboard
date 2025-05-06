import { supabase } from "../supabase";
import { ImageInsert, MudboardImage } from "@/types/image-type";

export async function uploadImageToSupabase(
  file: File,
  newImage: MudboardImage,
  fullImage?: File,
  thumbnailImage?: File
): Promise<ImageInsert> {
  const payload: ImageInsert = {
    image_id: newImage.image_id,
    original_name: newImage.original_name,
    file_ext: newImage.file_ext,
    width: newImage.width,
    height: newImage.height,
  };

  const folder = newImage.image_id;

  const uploads = [
    { name: `${folder}/medium.${newImage.file_ext}`, file },
    { name: `${folder}/full.${newImage.file_ext}`, file: fullImage },
    { name: `${folder}/thumb.${newImage.file_ext}`, file: thumbnailImage },
  ];

  for (const { name, file } of uploads) {
    if (!file) continue; // skip if optional (e.g. fullFile might be undefined)
    const { error } = await supabase.storage
      .from("mudboard-photos")
      .upload(name, file);
    if (error) {
      throw new Error(`Upload failed for ${name}: ${error.message}`);
    }
  }

  // now insert metadata
  const { error: insertError } = await supabase.from("images").insert(payload);

  if (insertError) {
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  console.log("Uploaded: ", file);

  return payload;
}
