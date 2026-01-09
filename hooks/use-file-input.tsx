import { handleImageFiles } from "@/app/converter/lib/image-handler";
import { useRef } from "react";

export function useFileInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = () => {
    inputRef.current?.click();
  };

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
          handleImageFiles(Array.from(files));
        }
      }}
    />
  );

  return {
    fileInput,
    triggerFilePicker,
  };
}
