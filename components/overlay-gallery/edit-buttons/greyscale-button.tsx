import { useState } from "react";
import { FaAdjust } from "react-icons/fa";

export function GreyscaleToggleButton({
  isGreyscale,
  onToggle,
}: {
  isGreyscale: boolean;
  onToggle: () => void;
}) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    onToggle();
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      title="Toggle Greyscale"
      className={`p-2 rounded-lg cursor-pointer group transition-all ${
        isGreyscale ? "bg-white text-stone-800/80" : ""
      }`}
    >
      <FaAdjust
        className={`transition-transform duration-400 ${
          clicked ? "animate-spin-once" : ""
        }`}
      />
    </button>
  );
}
