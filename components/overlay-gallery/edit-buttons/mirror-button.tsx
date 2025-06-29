import { FaArrowsAltH } from "react-icons/fa";

export function FlippedToggleButton({
  isFlipped,
  onToggle,
}: {
  isFlipped: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title="Flip Horizontally"
      className={`p-2 rounded-lg cursor-pointer hover:text-accent hover:scale-110 active:scale-95 group transition-all ${
        isFlipped ? "bg-white text-stone-800/80" : ""
      }`}
    >
      <FaArrowsAltH className="transition-transform duration-400" />
    </button>
  );
}
