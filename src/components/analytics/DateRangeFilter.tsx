import { DateRange } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  start?: string;
  end?: string;
  onStartChange?: (start: string) => void;
  onEndChange?: (end: string) => void;
}

export function DateRangeFilter({ value, onChange, start, end, onStartChange, onEndChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={value} onValueChange={(v) => onChange(v as DateRange)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">Last 7 Days</SelectItem>
          <SelectItem value="month">Last 30 Days</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      {value === 'custom' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="date" value={start || ''} onChange={(e) => onStartChange?.(e.target.value)} className="w-[160px]" />
          <Input type="date" value={end || ''} onChange={(e) => onEndChange?.(e.target.value)} className="w-[160px]" />
        </div>
      )}
    </div>
  );
}
