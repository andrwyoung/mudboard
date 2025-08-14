import { FaEyeDropper } from "react-icons/fa6";

export function EyedropperToggleButton({
  isEyedropperActive,
  onToggle,
}: {
  isEyedropperActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      title="Use Eyedropper"
      onClick={onToggle}
      className={`cursor-pointer hover:text-accent hover:primary-foreground transition-all p-2 rounded-lg ${
        isEyedropperActive ? "primary-foreground text-stone-800/80" : ""
      }`}
    >
      <FaEyeDropper />
    </button>
  );
}
