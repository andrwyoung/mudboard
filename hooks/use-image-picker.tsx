// this is the helper that helps bring up the file selector whenever we
// click on a "add image" button

import { useRef } from "react";
import { uploadImages } from "@/lib/upload-images/upload-images";

export function useImagePicker(sectionId: string, columnIndex?: number) {
  const inputRef = useRef<HTMLInputElement>(null);

  function triggerImagePicker() {
    inputRef.current?.click();
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          uploadImages(Array.from(files), sectionId, columnIndex);
        }
      }}
    />
  );

  return { triggerImagePicker, fileInput };
}
