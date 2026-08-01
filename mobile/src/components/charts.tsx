import { View, Text, useWindowDimensions } from 'react-native';
import { Svg, Rect, Line, G, Path, Circle, Text as SvgText } from 'react-native-svg';

export function BarChart({ data, color = '#6B46C1' }: { data: { label: string; value: number }[]; color?: string }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 48, 640);
  const chartHeight = 220;
  const padding = 32;
  const barWidth = (chartWidth - padding * 2) / data.length - 8;
  const max = Math.max(...data.map((d) => d.value), 5);

  return (
    <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (chartHeight - padding - 20);
          const x = padding + i * ((chartWidth - padding * 2) / data.length) + 4;
          const y = chartHeight - barHeight - 20;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill={color} opacity={0.9} />
              <SvgText
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={12}
                fontWeight="500"
              >
                {d.value.toFixed(1)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-2">
        {data.map((d, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-xs text-muted-foreground">{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const { width } = useWindowDimensions();
  const size = Math.min(width - 64, 260);
  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  let startAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(startAngle + angle);
    const y2 = cy + radius * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const slice = { path, color: d.color, label: d.label, value: d.value };
    startAngle += angle;
    return slice;
  });

  return (
    <View className="bg-card rounded-2xl border border-border p-4 shadow-sm items-center">
      <Svg width={size} height={size}>
        {slices.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} />
        ))}
        <Circle cx={cx} cy={cy} r={radius * 0.45} fill="#ffffff" opacity={0.9} />
      </Svg>
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((d, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <Text className="text-xs text-muted-foreground">
              {d.label} ({total ? Math.round((d.value / total) * 100) : 0}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function LineChart({ data, color = '#10B981' }: { data: { label: string; value: number }[]; color?: string }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 48, 640);
  const chartHeight = 200;
  const padding = 28;
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.value / max) * (chartHeight - padding * 2);
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <Svg width={chartWidth} height={chartHeight}>
        <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#E5E7EB" strokeWidth={1} />
        <Path d={pathD} fill="none" stroke={color} strokeWidth={3} />
        {points.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={color} />
            <SvgText x={p.x} y={p.y - 10} textAnchor="middle" fill="#6B7280" fontSize={12} fontWeight="500">
              {p.value.toFixed(1)}
            </SvgText>
          </G>
        ))}
      </Svg>
      <View className="flex-row justify-between px-2 mt-2">
        {points.map((p, i) => (
          <Text key={i} className="text-[10px] text-muted-foreground">
            {p.label.slice(-2)}
          </Text>
        ))}
      </View>
    </View>
  );
}
