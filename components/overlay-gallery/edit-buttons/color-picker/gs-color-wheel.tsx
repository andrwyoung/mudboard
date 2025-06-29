import React from "react";

export default function GreyscaleWheel({
  hoveredColor,
  luminance, // 0–100
}: {
  hoveredColor: string;
  luminance: number;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Hex Code */}
      <p className="text-xs font-mono text-stone-200 font-bold text-center">
        {hoveredColor.replace("#", "").toUpperCase()}
      </p>

      {/* Greyscale bar */}
      <div className="relative w-6 h-24 rounded-md overflow-hidden shadow-inner mt-1">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, black, white)",
          }}
        />
        {/* Line indicator */}
        <div
          className={`absolute left-0 w-full h-[2px]`}
          style={{
            top: `${100 - luminance}%`,
            backgroundColor: luminance > 50 ? "#111" : "#fff",
          }}
        />
      </div>
    </div>
  );
}
