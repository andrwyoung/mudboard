// this is the helper that helps bring up the file selector whenever we
// click on a "add image" button

import { useRef } from "react";
import { uploadImages } from "@/lib/upload-images/upload-images";

export function useImagePicker(sectionId: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const columnIndexRef = useRef<number | undefined>(undefined);
  const rowIndexRef = useRef<number | undefined>(undefined);

  function triggerImagePicker(columnIndex?: number, rowIndex?: number) {
    columnIndexRef.current = columnIndex;
    rowIndexRef.current = rowIndex;
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
          uploadImages(
            Array.from(files),
            sectionId,
            columnIndexRef.current,
            rowIndexRef.current
          );
        }
      }}
    />
  );

  return { triggerImagePicker, fileInput };
}
