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
  unit = "",
  gradient,
}: ColorSliderProps) {
  return (
    <div className="flex items-center gap-2 transition-all duration-200 opacity-100">
      <label className="font-header text-md font-semibold w-4 transition-colors duration-200 text-dark-text">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
        style={{
          background: gradient || "bg-secondary",
        }}
      />
      <span className="text-md font-header w-8 text-right transition-colors duration-200 text-dark-text  font-semibold">
        {value}
        {unit}
      </span>
    </div>
  );
}
