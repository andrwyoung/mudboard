import { useRef } from "react";

type UseFileInputProps = {
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
};

export function useFileInput({
  onChange,
  accept = "image/*",
  multiple = true,
}: UseFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = () => {
    inputRef.current?.click();
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      className="hidden"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          onChange(Array.from(files));
          // Reset input so the same file can be selected again
          e.target.value = "";
        }
      }}
    />
  );

  return {
    fileInput,
    triggerFilePicker,
  };
}
