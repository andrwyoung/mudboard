// components/section/section-icons.tsx/add-image-button.tsx
import { FaPlus } from "react-icons/fa";

type Props = {
  triggerImagePicker: () => void;
  fileInput: React.ReactNode;
};

export default function SectionAddImageButton({
  triggerImagePicker,
  fileInput,
}: Props) {
  return (
    <div className="group flex flex-row cursor-pointer text-primary">
      {fileInput}
      <button
        type="button"
        className="flex-shrink-0 relative size-6 group cursor-pointer hover:scale-95 
        transition-transform duration-200 flex items-center justify-center"
        onClick={triggerImagePicker}
        title="Add Image to Section"
      >
        <FaPlus className="z-2 size-5 text-primary group-hover:text-accent transition-colors duration-300" />
      </button>
    </div>
  );
}
