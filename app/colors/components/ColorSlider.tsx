interface ColorSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  isActive?: boolean;
}

export default function ColorSlider({
  label,
  min,
  max,
  value,
  onChange,
  unit = "",
  isActive = false,
}: ColorSliderProps) {
  return (
    <div
      className={`flex items-center gap-2 transition-all duration-200 ${
        isActive ? "opacity-100" : "opacity-60"
      }`}
    >
      <label
        className={`text-xs font-medium w-4 transition-colors duration-200 ${
          isActive
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
          isActive
            ? "bg-blue-200 dark:bg-blue-800"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      />
      <span
        className={`text-xs font-mono w-8 text-right transition-colors duration-200 ${
          isActive
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}
