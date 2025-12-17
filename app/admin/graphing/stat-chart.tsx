import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyStat } from "../admin-panel-v2";
import { formatDate } from "./format-date";
import { ChartTooltip } from "./chart-tooltip";

export default function StatChart({
  title,
  data,
}: {
  title: string;
  data: DailyStat[];
}) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold mb-3">{title}</h3>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, "dataMax"]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload) return null;
                return (
                  <ChartTooltip active={props.active} payload={props.payload} />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="currentColor"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
