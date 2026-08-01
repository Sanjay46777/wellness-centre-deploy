import { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  formatter?: (value: number) => string;
}

export function BarChart({ data, color = '#8B1E1E', formatter }: BarChartProps) {
  const chartData = useMemo(() => data.map((d) => ({ name: d.label, value: d.value })), [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip
            formatter={(value: number) => [formatter ? formatter(value) : value.toFixed(2), 'Rating']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={color} fillOpacity={0.8 + (i % 2) * 0.1} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
