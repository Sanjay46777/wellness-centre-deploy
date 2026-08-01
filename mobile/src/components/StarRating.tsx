import { Pressable, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={readOnly}
          onPress={() => onChange?.(star)}
          className={cn('p-1', !readOnly && 'active:opacity-60')}
        >
          <Star
            size={size}
            className={cn(
              star <= value ? 'text-amber-400' : 'text-muted',
              readOnly && star <= value ? 'fill-amber-400' : ''
            )}
            fill={star <= value ? '#fbbf24' : 'transparent'}
          />
        </Pressable>
      ))}
    </View>
  );
}
