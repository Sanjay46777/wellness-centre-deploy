import { FEEDBACK_QUESTIONS, type Counsellor, type Feedback } from '@/types';
import {
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
  monthlyTrend,
} from '@/lib/analytics';

export function fileName(prefix: string, ext: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${prefix}_feedback_${today}.${ext}`;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export {
  FEEDBACK_QUESTIONS,
  type Counsellor,
  type Feedback,
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
  monthlyTrend,
};
