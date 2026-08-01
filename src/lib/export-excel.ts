import * as XLSX from 'xlsx';
import {
  FEEDBACK_QUESTIONS,
  type Counsellor,
  type Feedback,
  fileName,
  triggerDownload,
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
} from './export-shared';

export function exportExcel(items: Feedback[], counsellor?: Counsellor) {
  const wb = XLSX.utils.book_new();
  const header = [
    'Date',
    'Counsellor',
    'Student ID',
    'Student Name',
    'Student Email',
    ...FEEDBACK_QUESTIONS.map((q) => q.label),
    'Recommendation',
    'Anonymous',
    'Comments',
  ];
  const rows = items.map((i) => [
    new Date(i.submitted_at).toLocaleDateString(),
    counsellor ? counsellor.name : i.counsellor_name || i.counsellor_id,
    i.student_id ?? '',
    i.student_name ?? '',
    i.student_email ?? '',
    ...FEEDBACK_QUESTIONS.map((q) => (i as any)[q.key] ?? ''),
    i.recommendation ?? '',
    i.is_anonymous ? 'Yes' : 'No',
    i.comments ?? '',
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([header, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Feedback');

  const perQ = averageRatingPerQuestion(items);
  const rec = recommendationBreakdown(items);
  const summary = [
    ['Metric', 'Value'],
    ['Total Feedback', items.length],
    ['Average Rating', averageRating(items).toFixed(2)],
    ['Recommendation Yes %', `${rec.yesPct}%`],
    ...FEEDBACK_QUESTIONS.map((q) => [q.label, perQ[q.key].toFixed(2)]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  triggerDownload(
    new Blob([buf], { type: 'application/octet-stream' }),
    fileName(counsellor ? counsellor.name.replace(/\s+/g, '_') : 'Institution', 'xlsx')
  );
}
