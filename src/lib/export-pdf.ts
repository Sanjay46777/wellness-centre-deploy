import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  FEEDBACK_QUESTIONS,
  type Counsellor,
  type Feedback,
  fileName,
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
} from './export-shared';
import { IITM_LOGO_URL } from './assets';

export function exportPDF(items: Feedback[], counsellor?: Counsellor) {
  const doc = new jsPDF();
  const title = counsellor
    ? `${counsellor.name} Feedback Report`
    : 'Wellness Centre Feedback Report';

  doc.setFillColor(139, 30, 30);
  doc.rect(0, 0, 210, 42, 'F');
  try {
    doc.addImage(IITM_LOGO_URL, 'PNG', 14, 5, 22, 22);
  } catch {
    // ignore logo loading errors
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 40, 22);
  doc.setFontSize(11);
  doc.text('IIT Madras Wellness Centre', 40, 30);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 40, 36);

  doc.setTextColor(31, 41, 55);
  const avg = averageRating(items);
  const rec = recommendationBreakdown(items);
  doc.setFontSize(14);
  doc.text(`Total Feedback: ${items.length}`, 14, 56);
  doc.text(`Average Rating: ${avg.toFixed(2)} / 5`, 70, 56);
  doc.text(`Recommendation Yes: ${rec.yesPct}%`, 130, 56);

  const perQ = averageRatingPerQuestion(items);
  const rows = FEEDBACK_QUESTIONS.map((q) => [q.label, perQ[q.key].toFixed(2)]);
  (doc as any).autoTable({
    startY: 66,
    head: [['Question', 'Average Rating']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [139, 30, 30], textColor: 255 },
    styles: { fontSize: 10 },
  });

  const feedbackRows = items.slice(0, 25).map((f) => [
    new Date(f.submitted_at).toLocaleDateString(),
    f.student_id || '—',
    f.student_name || '—',
    f.student_email || '—',
    f.q10_overall ?? '—',
    f.recommendation || '—',
    f.comments ? String(f.comments).slice(0, 60) : '—',
  ]);
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 14,
    head: [['Date', 'Student ID', 'Student Name', 'Email', 'Overall', 'Rec.', 'Comments']],
    body: feedbackRows,
    theme: 'grid',
    headStyles: { fillColor: [139, 30, 30], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: { 6: { cellWidth: 70 } },
  });

  doc.save(fileName(counsellor ? counsellor.name.replace(/\s+/g, '_') : 'Institution', 'pdf'));
}
