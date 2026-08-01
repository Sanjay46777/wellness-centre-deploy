import { useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateTimePicker from 'react-native-ui-datepicker';
import type { DateRange } from '@/types';

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangeFilter({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  customStart?: Date;
  customEnd?: Date;
  onCustomChange: (start: Date, end: Date) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const label = OPTIONS.find((o) => o.value === value)?.label ?? 'All Time';

  return (
    <View className="flex-row items-center gap-2">
      <Select
        value={{ value, label }}
        onValueChange={(option) => {
          const next = option?.value as DateRange;
          onChange(next ?? 'all');
          if (next === 'custom') setCustomOpen(true);
        }}
      >
        <SelectTrigger className="flex-row items-center gap-2 px-3">
          <Calendar size={16} className="text-primary" />
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} label={o.label}>
              <Text>{o.label}</Text>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Modal visible={customOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center p-4">
          <View className="bg-background rounded-2xl p-4 w-full max-w-md">
            <Text className="text-lg font-semibold text-foreground mb-3">Select Custom Range</Text>
            <DateTimePicker
              mode="range"
              startDate={customStart}
              endDate={customEnd}
              onChange={(params) => {
                if (params.startDate && params.endDate) {
                  onCustomChange(params.startDate as Date, params.endDate as Date);
                }
              }}
            />
            <Button onPress={() => setCustomOpen(false)} className="mt-4">
              <Text>Done</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
