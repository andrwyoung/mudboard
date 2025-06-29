import React from "react";

export default function ColorWheel({
  hoveredColor,
  hoveredHSV,
  isColorLight,
}: {
  hoveredColor: string;
  hoveredHSV: {
    h: number;
    s: number;
    v: number;
  };
  isColorLight: boolean;
}) {
  return (
    <div className="flex flex-col items-center ">
      <p className="text-xs font-mono text-stone-200 font-bold text-center">
        {hoveredColor.replace("#", "").toUpperCase()}
      </p>

      <div className="relative w-24 h-24 rounded-t-md overflow-hidden shadow-inner ">
        <div
          className="absolute inset-0"
          style={{
            background: `hsl(${hoveredHSV.h}, 100%, 50%)`,
            maskImage: `linear-gradient(to right, black, white)`,
            WebkitMaskImage: `linear-gradient(to right, black, white)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, black, transparent), linear-gradient(to left, transparent, white)",
          }}
        />
        <div
          className={`absolute w-3 h-3 rounded-full border-2 ${
            isColorLight ? "border-stone-800" : "border-white"
          }`}
          style={{
            left: `${hoveredHSV.s}%`,
            top: `${100 - hoveredHSV.v}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      {/* Hue bar */}
      <div className="relative w-24 h-4  rounded-b-md overflow-hidden shadow-inner">
        {/* Gradient bar */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
        {/* Pointer */}
        <div
          className={`absolute top-1/2 w-[3px] h-4 
            ${
              hoveredHSV.h >= 20 && hoveredHSV.h <= 140
                ? "bg-slate-500"
                : "bg-white"
            }`}
          style={{
            left: `${(hoveredHSV.h / 360) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      {/* <div className="absolute top-0 left-[-4.5rem] text-xs font-mono text-stone-200 leading-tight space-y-0.5">
                    <p>H: {hoveredHSV.h}°</p>
                    <p>S: {hoveredHSV.s}%</p>
                    <p>V: {hoveredHSV.v}%</p>
                  </div> */}
    </div>
  );
}
