import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BoardDailyStat } from "../admin-panel-v2";
import { formatDate } from "./format-date";
import { ChartTooltip } from "./chart-tooltip";

export default function BoardStatChart({
  title,
  data,
}: {
  title: string;
  data: BoardDailyStat[];
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
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    additionalContent={(data) => {
                      const boardData = data as BoardDailyStat;
                      return boardData.uniqueUsers !== undefined ? (
                        <p className="text-sm text-primary">
                          Unique users: {boardData.uniqueUsers}
                        </p>
                      ) : null;
                    }}
                  />
                );
              }}
            />

            {/* Total boards */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="currentColor"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total boards"
            />

            {/* Demo boards */}
            <Line
              type="monotone"
              dataKey="demos"
              stroke="#9ca3af"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Demo boards"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
