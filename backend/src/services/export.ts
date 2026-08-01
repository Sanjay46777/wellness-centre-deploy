import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  FEEDBACK_QUESTIONS,
  FeedbackItem,
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
  monthlyTrend,
} from './analytics';

function fileName(prefix: string, ext: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${prefix}_feedback_${today}.${ext}`;
}

export async function exportPPT(items: FeedbackItem[], counsellorName?: string) {
  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_16x9';
  const title = counsellorName
    ? `${counsellorName} Feedback Report`
    : 'Wellness Centre Feedback Report';

  const slide1 = ppt.addSlide();
  slide1.background = { color: 'F9FAFB' };
  slide1.addText(title, { x: 1, y: 2, w: 8, h: 1, fontSize: 28, color: '8B1E1E', bold: true });
  slide1.addText('IIT Madras Wellness Centre Feedback Platform', {
    x: 1,
    y: 3.2,
    w: 8,
    h: 0.5,
    fontSize: 14,
    color: '4B5563',
  });
  slide1.addText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 1,
    y: 3.8,
    w: 8,
    h: 0.5,
    fontSize: 12,
    color: '9CA3AF',
  });

  const avg = averageRating(items);
  const rec = recommendationBreakdown(items);
  const slide2 = ppt.addSlide();
  slide2.background = { color: 'FFFFFF' };
  slide2.addText('Summary Metrics', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 20,
    color: '8B1E1E',
    bold: true,
  });
  slide2.addText(`Total Feedback: ${items.length}`, { x: 0.5, y: 1.5, w: 4, h: 0.5, fontSize: 14 });
  slide2.addText(`Average Rating: ${avg.toFixed(2)} / 5`, { x: 0.5, y: 2.2, w: 4, h: 0.5, fontSize: 14 });
  slide2.addText(`Recommendation Yes: ${rec.yesPct}%`, { x: 5, y: 1.5, w: 4, h: 0.5, fontSize: 14 });

  const perQ = averageRatingPerQuestion(items);
  const chartData = FEEDBACK_QUESTIONS.map((q) => ({
    name: q.label,
    labels: [q.label],
    values: [Number(perQ[q.key].toFixed(2))],
  }));
  const slide3 = ppt.addSlide();
  slide3.addText('Ratings by Question', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 18,
    color: '8B1E1E',
    bold: true,
  });
  slide3.addChart(ppt.ChartType.bar, chartData, {
    x: 0.5,
    y: 1,
    w: 9,
    h: 4.5,
    barDir: 'bar',
    chartColors: ['8B1E1E'],
  });

  const trend = monthlyTrend(items);
  if (trend.length > 0) {
    const trendData = [
      {
        name: 'Monthly Avg',
        labels: trend.map((t) => t.month),
        values: trend.map((t) => Number(t.avg.toFixed(2))),
      },
    ];
    const slide4 = ppt.addSlide();
    slide4.addText('Monthly Trend', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 18,
      color: '8B1E1E',
      bold: true,
    });
    slide4.addChart(ppt.ChartType.line, trendData, {
      x: 0.5,
      y: 1,
      w: 9,
      h: 4.5,
      chartColors: ['10B981'],
    });
  }

  const comments = items.filter((i) => i.comments).slice(0, 6);
  if (comments.length) {
    const slide5 = ppt.addSlide();
    slide5.addText('Selected Comments', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 18,
      color: '8B1E1E',
      bold: true,
    });
    let y = 1;
    for (const c of comments) {
      const text = `"${c.comments}" — ${c.is_anonymous ? 'Anonymous' : 'Respondent'}`;
      slide5.addText(text, { x: 0.5, y, w: 9, h: 0.8, fontSize: 12, color: '374151' });
      y += 1;
    }
  }

  return (await ppt.write({ outputType: 'nodebuffer' })) as Buffer;
}

export function exportPDF(items: FeedbackItem[], counsellorName?: string) {
  const doc = new jsPDF();
  const title = counsellorName
    ? `${counsellorName} Feedback Report`
    : 'Wellness Centre Feedback Report';
  doc.setFillColor(139, 30, 30);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  doc.setTextColor(31, 41, 55);
  const avg = averageRating(items);
  const rec = recommendationBreakdown(items);
  doc.setFontSize(14);
  doc.text(`Total Feedback: ${items.length}`, 14, 50);
  doc.text(`Average Rating: ${avg.toFixed(2)} / 5`, 14, 58);
  doc.text(`Recommendation Yes: ${rec.yesPct}%`, 14, 66);

  const perQ = averageRatingPerQuestion(items);
  const rows = FEEDBACK_QUESTIONS.map((q) => [q.label, perQ[q.key].toFixed(2)]);
  (doc as any).autoTable({
    startY: 78,
    head: [['Question', 'Average Rating']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [139, 30, 30], textColor: 255 },
  });

  const comments = items.filter((i) => i.comments).slice(0, 10);
  let y = (doc as any).lastAutoTable.finalY + 14;
  if (comments.length && y < 250) {
    doc.setFontSize(14);
    doc.text('Selected Comments', 14, y);
    y += 8;
    doc.setFontSize(11);
    for (const c of comments) {
      const text = `"${c.comments}"`;
      const split = doc.splitTextToSize(text, 180);
      doc.text(split, 14, y);
      y += split.length * 5 + 4;
      if (y > 280) break;
    }
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function exportExcel(items: FeedbackItem[], counsellorName?: string) {
  const wb = XLSX.utils.book_new();
  const header = [
    'Date',
    'Counsellor',
    ...FEEDBACK_QUESTIONS.map((q) => q.label),
    'Recommendation',
    'Anonymous',
    'Comments',
  ];
  const rows = items.map((i) => [
    new Date(i.submitted_at).toLocaleDateString(),
    counsellorName || i.counsellor_name || i.counsellor_id,
    ...FEEDBACK_QUESTIONS.map((q) => i[q.key] ?? ''),
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

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
