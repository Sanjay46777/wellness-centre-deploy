import { useMemo } from 'react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartProps {
  data: { label: string; value: number }[];
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export function PieChart({ data }: PieChartProps) {
  const chartData = useMemo(() => data.map((d) => ({ name: d.label, value: d.value })), [data]);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
          <Legend verticalAlign="bottom" height={36} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
