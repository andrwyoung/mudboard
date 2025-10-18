interface ColorSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

export default function ColorSlider({
  label,
  min,
  max,
  value,
  onChange,
  unit = "",
}: ColorSliderProps) {
  return (
    <div className="flex items-center gap-2 transition-all duration-200 opacity-100">
      <label className="text-xs font-semibold w-4 transition-colors duration-200 text-blue-600 dark:text-blue-400">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200 bg-blue-200 dark:bg-blue-800"
      />
      <span className="text-xs font-mono w-8 text-right transition-colors duration-200 text-blue-600 dark:text-blue-400 font-semibold">
        {value}
        {unit}
      </span>
    </div>
  );
}
