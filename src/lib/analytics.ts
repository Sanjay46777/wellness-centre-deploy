import { FEEDBACK_QUESTIONS, type Feedback } from '@/types';

export function isInRange(
  date: string,
  range: 'week' | 'month' | 'all' | 'custom',
  customStart?: Date,
  customEnd?: Date
) {
  if (range === 'all') return true;
  const d = new Date(date);
  const now = new Date();
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return d >= start;
  }
  if (range === 'month') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return d >= start;
  }
  if (range === 'custom' && customStart && customEnd) {
    return d >= customStart && d <= customEnd;
  }
  return true;
}

export function averageRating(items: Feedback[]) {
  if (items.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const item of items) {
    for (const q of FEEDBACK_QUESTIONS) {
      const v = item[q.key as keyof Feedback];
      if (typeof v === 'number') {
        total += v;
        count++;
      }
    }
  }
  return count === 0 ? 0 : total / count;
}

export function averageRatingPerQuestion(items: Feedback[]) {
  const result: Record<string, number> = {};
  for (const q of FEEDBACK_QUESTIONS) {
    const values = items
      .map((i) => i[q.key as keyof Feedback])
      .filter((v): v is number => typeof v === 'number');
    result[q.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }
  return result;
}

export function recommendationBreakdown(items: Feedback[]) {
  const counts = { Yes: 0, No: 0, Maybe: 0 };
  let total = 0;
  for (const item of items) {
    if (item.recommendation) {
      counts[item.recommendation]++;
      total++;
    }
  }
  return { counts, total, yesPct: total ? Math.round((counts.Yes / total) * 100) : 0 };
}

export function monthlyTrend(items: Feedback[]) {
  const map = new Map<string, { month: string; avg: number; count: number }>();
  for (const item of items) {
    const d = new Date(item.submitted_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = map.get(key);
    const avg = averageRating([item]);
    if (existing) {
      existing.avg = (existing.avg * existing.count + avg) / (existing.count + 1);
      existing.count++;
    } else {
      map.set(key, { month: key, avg, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function questionAveragesForChart(items: Feedback[]) {
  return FEEDBACK_QUESTIONS.map((q) => {
    const values = items
      .map((i) => i[q.key as keyof Feedback])
      .filter((v): v is number => typeof v === 'number');
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { label: q.label, value: Number(avg.toFixed(2)) };
  });
}
