import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  error?: string;
}

export function StarRating({ value, onChange, label, error }: StarRatingProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded p-1 transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Rate ${star}`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                star <= value ? 'fill-accent text-accent' : 'fill-muted text-muted'
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-accent">{value}/5</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
