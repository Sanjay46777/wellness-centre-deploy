import { useMemo } from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: { month: string; avg: number; count: number }[];
}

export function LineChart({ data }: LineChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: d.month,
        avg: Number(d.avg.toFixed(2)),
        count: d.count,
      })),
    [data]
  );

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip
            formatter={(value: number, _name, props: any) => [
              value.toFixed(2),
              `Avg (${props.payload.count} responses)`,
            ]}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#8B1E1E"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8B1E1E' }}
            activeDot={{ r: 6 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
