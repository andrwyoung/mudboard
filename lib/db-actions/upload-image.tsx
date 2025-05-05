import { supabase } from "../supabase";
import { ImageInsert, MudboardImage } from "@/types/image-type";

export async function uploadImageToSupabase(
  file: File,
  newImage: MudboardImage
): Promise<ImageInsert> {
  const payload: ImageInsert = {
    image_id: newImage.image_id,
    original_name: newImage.original_name,
    file_ext: newImage.file_ext,
    width: newImage.width,
    height: newImage.height,
  };

  const fileName = `${newImage.image_id}.${newImage.file_ext}`;

  // upload image to storage
  const { error: uploadError } = await supabase.storage
    .from("mudboard-photos")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // now insert metadata
  const { error: insertError } = await supabase.from("images").insert(payload);

  if (insertError) {
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  console.log("Uploaded: ", file);

  return payload;
}
