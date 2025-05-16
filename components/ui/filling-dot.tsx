import React from "react";

export default function FillingDot({
  selected = false,
}: {
  selected?: boolean;
}) {
  return (
    <div className="flex-shrink-0 relative size-3 group cursor-pointer hover:scale-95 transition-transform">
      {/* Outer circle border */}
      <div className="absolute inset-0 rounded-full border-2 border-accent" />

      {/* Inner fill that animates on hover */}
      <div
        className={`
        absolute inset-0 rounded-full bg-accent origin-center transition-transform duration-700
        ${selected ? "scale-80" : "scale-0 group-hover:scale-100"}
      `}
      />
    </div>
  );
}
