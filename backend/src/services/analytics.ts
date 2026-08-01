export const FEEDBACK_QUESTIONS = [
  { key: 'q1_comfort', label: 'Comfort expressing thoughts' },
  { key: 'q2_understood', label: 'Felt understood' },
  { key: 'q3_time', label: 'Given enough time' },
  { key: 'q4_quality', label: 'Overall quality of session' },
  { key: 'q5_respected', label: 'Felt respected' },
  { key: 'q6_supported', label: 'Felt emotionally supported' },
  { key: 'q7_hopeful', label: 'Felt hopeful after session' },
  { key: 'q8_safe', label: 'Environment felt safe' },
  { key: 'q9_communication', label: 'Communication was clear' },
  { key: 'q10_overall', label: 'Overall experience' },
] as const;

export type FeedbackItem = {
  [key: string]: any;
  submitted_at: string;
  recommendation?: 'Yes' | 'No' | 'Maybe' | null;
  counsellor_id?: number;
  counsellor_name?: string;
  designation?: string;
};

export function isInRange(
  date: string,
  range: 'week' | 'month' | 'all' | 'custom',
  customStart?: string,
  customEnd?: string
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
    return d >= new Date(customStart) && d <= new Date(customEnd);
  }
  return true;
}

export function averageRating(items: FeedbackItem[]) {
  if (items.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const item of items) {
    for (const q of FEEDBACK_QUESTIONS) {
      const v = item[q.key];
      if (typeof v === 'number') {
        total += v;
        count++;
      }
    }
  }
  return count === 0 ? 0 : total / count;
}

export function averageRatingPerQuestion(items: FeedbackItem[]) {
  const result: Record<string, number> = {};
  for (const q of FEEDBACK_QUESTIONS) {
    const values = items.map((i) => i[q.key]).filter((v): v is number => typeof v === 'number');
    result[q.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }
  return result;
}

export function recommendationBreakdown(items: FeedbackItem[]) {
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

export function monthlyTrend(items: FeedbackItem[]) {
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

export function questionAveragesForChart(items: FeedbackItem[]) {
  return FEEDBACK_QUESTIONS.map((q) => {
    const values = items.map((i) => i[q.key]).filter((v): v is number => typeof v === 'number');
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { label: q.label, value: Number(avg.toFixed(2)) };
  });
}

export function computeFeedbackStats(items: FeedbackItem[]) {
  return {
    total_feedback: items.length,
    avg_rating: Number(averageRating(items).toFixed(2)),
    recommendation: recommendationBreakdown(items),
    monthly_trend: monthlyTrend(items),
    question_averages: questionAveragesForChart(items),
  };
}
