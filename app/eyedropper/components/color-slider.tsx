import { useState, useRef, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import { toast } from "sonner";

interface ColorSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  gradient?: string; // CSS gradient for the slider track
}

export default function ColorSlider({
  label,
  min,
  max,
  value,
  onChange,
  gradient,
}: ColorSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when external value changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);

    // Check for invalid numbers or non-sensical values
    if (isNaN(numValue) || !isFinite(numValue) || inputValue.trim() === "") {
      setInputValue(value.toString()); // Reset to current value if invalid
      return;
    }

    // If the value is way out of range, revert to original instead of clamping
    if (numValue < min || numValue > max) {
      setInputValue(value.toString()); // Reset to current value if out of range
      return;
    }

    // Value is valid and in range - update it
    onChange(numValue);
    setInputValue(numValue.toString());
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    // Select all text when focusing for the first time
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value.toString());
      toast.success(`Copied "${value}" to clipboard`);
    } catch (err) {
      console.error("Failed to copy value:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 transition-all duration-200 opacity-100">
      <label className="font-header text-md font-semibold w-4 transition-colors duration-200 ">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-3 rounded-lg appearance-none cursor-pointer transition-all duration-200 slider-custom"
        style={{
          background: gradient || "bg-secondary",
        }}
      />
      <div className="flex flex-row items-center">
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="text-md font-header w-10 text-right transition-colors 
        duration-200 font-semibold bg-transparent border-none outline-none focus:bg-slate-100 rounded px-1 
        [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          placeholder={value.toString()}
        />
        {/* <span className="text-md font-header ml-0.5  transition-colors duration-200 font-semibold">
          {unit}
        </span> */}
        <button
          onClick={copyToClipboard}
          className="ml-1 cursor-pointer opacity-80 rounded transition-colors duration-200 hover:text-accent hover:opacity-100 "
          title={`Copy ${value}`}
        >
          <FaCopy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
