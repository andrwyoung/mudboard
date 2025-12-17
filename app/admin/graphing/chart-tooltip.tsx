import React from "react";
import { formatDate } from "./format-date";

type ChartDataPoint = {
  date: string;
  [key: string]: unknown;
};

type TooltipContentProps = {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string;
    value?: unknown;
    color?: string;
    payload: ChartDataPoint;
  }>;
  additionalContent?: (data: ChartDataPoint) => React.ReactNode;
};

export function ChartTooltip({
  active,
  payload,
  additionalContent,
}: TooltipContentProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-popover border rounded-md p-2 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">
        {formatDate(data.date)}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {String(entry.value ?? "")}
        </p>
      ))}
      {additionalContent && additionalContent(data)}
    </div>
  );
}
