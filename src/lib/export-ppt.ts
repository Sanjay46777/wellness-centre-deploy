import PptxGenJS from 'pptxgenjs';
import {
  FEEDBACK_QUESTIONS,
  type Counsellor,
  type Feedback,
  fileName,
  averageRating,
  averageRatingPerQuestion,
  recommendationBreakdown,
  monthlyTrend,
} from './export-shared';
import type { LeaderboardEntry } from '@/types';
import { IITM_LOGO_URL, WELLNESS_CENTRE_LOGO_URL } from './assets';

const ACCENT = '8B1E1E';
const TEXT = '1F2937';
const MUTED = '6B7280';
const LIGHT_BG = 'F9FAFB';
const WHITE = 'FFFFFF';
const BORDER = 'E5E7EB';
const DARK_ACCENT = '5C1515';

const SHAPE_RECT = 'rect' as any;
const SHAPE_LINE = 'line' as any;
const CHART_BAR = 'bar' as any;
const CHART_DOUGHNUT = 'doughnut' as any;
const CHART_LINE = 'line' as any;

function addLogoHeader(slide: PptxGenJS.Slide) {
  slide.addShape(SHAPE_RECT, {
    x: 0,
    y: 0,
    w: '100%',
    h: 1.05,
    fill: { color: WHITE },
  });
  try {
    slide.addImage({ path: IITM_LOGO_URL, x: 0.4, y: 0.18, w: 0.72, h: 0.72 });
  } catch {
    // ignore logo loading errors
  }
  try {
    slide.addImage({ path: WELLNESS_CENTRE_LOGO_URL, x: 8.9, y: 0.18, w: 0.72, h: 0.72 });
  } catch {
    // ignore logo loading errors
  }
  slide.addShape(SHAPE_RECT, {
    x: 0,
    y: 1,
    w: '100%',
    h: 0.04,
    fill: { color: ACCENT },
  });
}

function addFooter(slide: PptxGenJS.Slide, dateStr: string) {
  slide.addShape(SHAPE_LINE, {
    x: 0.4,
    y: 5.35,
    w: 9.2,
    h: 0,
    line: { color: BORDER, width: 0.5 },
  });
  slide.addText('IIT Madras · Wellness Centre', {
    x: 0.4,
    y: 5.4,
    w: 5,
    h: 0.2,
    fontSize: 9,
    color: MUTED,
  });
  slide.addText(`Generated on ${dateStr}`, {
    x: 6,
    y: 5.4,
    w: 3.6,
    h: 0.2,
    align: 'right',
    fontSize: 9,
    color: MUTED,
  });
}

function addSectionTitle(slide: PptxGenJS.Slide, title: string) {
  slide.addText(title, {
    x: 0.5,
    y: 1.35,
    w: 9,
    h: 0.55,
    fontSize: 24,
    color: ACCENT,
    bold: true,
    fontFace: 'Georgia',
  });
  slide.addShape(SHAPE_RECT, {
    x: 0.5,
    y: 1.9,
    w: 0.6,
    h: 0.04,
    fill: { color: ACCENT },
  });
}

function truncate(str: string, len: number) {
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

function groupByCounsellor(items: Feedback[]) {
  const map = new Map<number, { id: number; name: string; designation: string | null; team: string | null; items: Feedback[] }>();
  for (const item of items) {
    const id = item.counsellor_id ?? 0;
    let g = map.get(id);
    if (!g) {
      g = {
        id,
        name: item.counsellor_name || 'Unknown',
        designation: item.designation || null,
        team: item.team || null,
        items: [],
      };
      map.set(id, g);
    }
    g.items.push(item);
  }
  return Array.from(map.values()).sort((a, b) => averageRating(b.items) - averageRating(a.items));
}

export function exportPPT(
  items: Feedback[],
  counsellor?: Counsellor,
  leaderboard?: LeaderboardEntry[]
) {
  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_16x9';
  ppt.author = 'IIT Madras Wellness Centre';
  ppt.subject = 'Counsellor Feedback Report';
  ppt.title = counsellor
    ? `${counsellor.name} Feedback Report`
    : 'Wellness Centre Feedback Report';

  const dateStr = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isInstitution = !counsellor;
  const titleText = counsellor
    ? `${counsellor.name} Feedback Report`
    : 'Wellness Centre Feedback Report';
  const subtitleText = counsellor
    ? `${counsellor.designation || 'Counsellor'} · ${counsellor.team || 'Institution'}`
    : 'Institution-wide Feedback Summary';

  // ── Cover slide ──
  const cover = ppt.addSlide();
  cover.background = { color: LIGHT_BG };
  cover.addShape(SHAPE_RECT, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.2,
    fill: { color: ACCENT },
  });
  try {
    cover.addImage({ path: IITM_LOGO_URL, x: 4.4, y: 0.6, w: 1.2, h: 1.2 });
  } catch {
    // ignore
  }
  try {
    cover.addImage({ path: WELLNESS_CENTRE_LOGO_URL, x: 4.4, y: 2.1, w: 1.2, h: 1.2 });
  } catch {
    // ignore
  }
  cover.addText('IIT Madras', {
    x: 1,
    y: 3.6,
    w: 8,
    h: 0.4,
    align: 'center',
    fontSize: 14,
    color: MUTED,
    fontFace: 'Georgia',
  });
  cover.addText(titleText, {
    x: 1,
    y: 4.1,
    w: 8,
    h: 0.7,
    align: 'center',
    fontSize: 32,
    color: ACCENT,
    bold: true,
    fontFace: 'Georgia',
  });
  cover.addText(subtitleText, {
    x: 1,
    y: 4.8,
    w: 8,
    h: 0.4,
    align: 'center',
    fontSize: 14,
    color: TEXT,
  });
  cover.addText(dateStr, {
    x: 1,
    y: 5.2,
    w: 8,
    h: 0.3,
    align: 'center',
    fontSize: 12,
    color: MUTED,
  });

  if (items.length === 0) {
    const empty = ppt.addSlide();
    addLogoHeader(empty);
    addSectionTitle(empty, 'No data');
    empty.addText('No feedback is available for the selected period.', {
      x: 1,
      y: 2.6,
      w: 8,
      h: 0.6,
      align: 'center',
      fontSize: 16,
      color: MUTED,
    });
    addFooter(empty, dateStr);
    ppt.writeFile({
      fileName: fileName(counsellor ? counsellor.name.replace(/\s+/g, '_') : 'Institution', 'pptx'),
    });
    return;
  }

  const avg = averageRating(items);
  const rec = recommendationBreakdown(items);
  const perQ = averageRatingPerQuestion(items);
  const trend = monthlyTrend(items);

  // ── Executive summary ──
  const summary = ppt.addSlide();
  summary.background = { color: WHITE };
  addLogoHeader(summary);
  addSectionTitle(summary, 'Executive Summary');
  const metrics = [
    { label: 'Total Feedback', value: String(items.length) },
    { label: 'Average Rating', value: `${avg.toFixed(2)} / 5` },
    { label: 'Recommendation Yes', value: `${rec.yesPct}%` },
  ];
  let mx = 0.5;
  for (const m of metrics) {
    summary.addShape(SHAPE_RECT, {
      x: mx,
      y: 2.35,
      w: 2.8,
      h: 1.45,
      fill: { color: LIGHT_BG },
      line: { color: BORDER, width: 1 },
      rectRadius: 0.12,
    });
    summary.addText(m.value, {
      x: mx,
      y: 2.55,
      w: 2.8,
      h: 0.55,
      align: 'center',
      fontSize: 26,
      color: ACCENT,
      bold: true,
      fontFace: 'Georgia',
    });
    summary.addText(m.label, {
      x: mx,
      y: 3.15,
      w: 2.8,
      h: 0.5,
      align: 'center',
      fontSize: 12,
      color: MUTED,
    });
    mx += 3.2;
  }
  if (isInstitution) {
    summary.addText(
      `This report covers ${items.length} student feedback responses across the counselling team. Use the following slides to explore question-level ratings, recommendation trends, counsellor performance, and detailed comments.`,
      {
        x: 0.5,
        y: 4.2,
        w: 9,
        h: 0.9,
        fontSize: 12,
        color: TEXT,
        lineSpacing: 18,
      }
    );
  } else {
    summary.addText(
      `This report covers ${items.length} student feedback responses for ${counsellor!.name}.`,
      {
        x: 0.5,
        y: 4.2,
        w: 9,
        h: 0.9,
        fontSize: 12,
        color: TEXT,
        lineSpacing: 18,
      }
    );
  }
  addFooter(summary, dateStr);

  // ── Ratings by question ──
  const qSlide = ppt.addSlide();
  qSlide.background = { color: WHITE };
  addLogoHeader(qSlide);
  addSectionTitle(qSlide, 'Ratings by Question');
  const qChartData = FEEDBACK_QUESTIONS.map((q) => ({
    name: q.label,
    labels: [q.label],
    values: [Number(perQ[q.key].toFixed(2))],
  }));
  qSlide.addChart(CHART_BAR, qChartData, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 3.2,
    barDir: 'bar',
    chartColors: [ACCENT],
    showValue: true,
    dataLabelPosition: 'outEnd',
    dataLabelFontSize: 10,
    dataLabelColor: TEXT,
    valAxisMaxVal: 5,
    valAxisMinVal: 0,
    catAxisLabelColor: MUTED,
    catAxisLabelFontSize: 10,
    showLegend: false,
  });
  addFooter(qSlide, dateStr);

  // ── Recommendation breakdown ──
  const recSlide = ppt.addSlide();
  recSlide.background = { color: WHITE };
  addLogoHeader(recSlide);
  addSectionTitle(recSlide, 'Recommendation Breakdown');
  const recData = [
    {
      name: 'Recommendation',
      labels: ['Yes', 'No', 'Maybe'],
      values: [rec.counts.Yes, rec.counts.No, rec.counts.Maybe],
    },
  ];
  recSlide.addChart(CHART_DOUGHNUT, recData, {
    x: 2.5,
    y: 2.2,
    w: 5,
    h: 3.2,
    chartColors: [ACCENT, '6B7280', 'D1D5DB'],
    showPercent: true,
    showValue: false,
    holeSize: 55,
  });
  recSlide.addText(
    `Yes: ${rec.counts.Yes}   ·   No: ${rec.counts.No}   ·   Maybe: ${rec.counts.Maybe}`,
    {
      x: 1,
      y: 5.1,
      w: 8,
      h: 0.3,
      align: 'center',
      fontSize: 12,
      color: TEXT,
    }
  );
  addFooter(recSlide, dateStr);

  // ── Monthly trend ──
  if (trend.length > 1) {
    const trendData = [
      {
        name: 'Monthly Average',
        labels: trend.map((t) => t.month),
        values: trend.map((t) => Number(t.avg.toFixed(2))),
      },
    ];
    const trendSlide = ppt.addSlide();
    trendSlide.background = { color: WHITE };
    addLogoHeader(trendSlide);
    addSectionTitle(trendSlide, 'Monthly Trend');
    trendSlide.addChart(CHART_LINE, trendData, {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 3.2,
      chartColors: [ACCENT],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 8,
      lineSmooth: true,
      showValue: true,
      dataLabelFontSize: 9,
      valAxisMaxVal: 5,
      valAxisMinVal: 0,
      showLegend: false,
    });
    addFooter(trendSlide, dateStr);
  }

  // ── Institution: per-counsellor performance ──
  if (isInstitution) {
    const grouped = groupByCounsellor(items);
    if (grouped.length > 0) {
      const perfSlide = ppt.addSlide();
      perfSlide.background = { color: WHITE };
      addLogoHeader(perfSlide);
      addSectionTitle(perfSlide, 'Counsellor Performance');
      const perfChartData = grouped.slice(0, 12).map((g) => ({
        name: truncate(g.name, 24),
        labels: [truncate(g.name, 24)],
        values: [Number(averageRating(g.items).toFixed(2))],
      }));
      perfSlide.addChart(CHART_BAR, perfChartData, {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 3.2,
        barDir: 'bar',
        chartColors: [ACCENT],
        showValue: true,
        dataLabelPosition: 'outEnd',
        dataLabelFontSize: 10,
        valAxisMaxVal: 5,
        valAxisMinVal: 0,
        catAxisLabelColor: MUTED,
        catAxisLabelFontSize: 9,
        showLegend: false,
      });
      addFooter(perfSlide, dateStr);
    }

    // Leaderboard table
    if (leaderboard && leaderboard.length > 0) {
      const lbSlide = ppt.addSlide();
      lbSlide.background = { color: WHITE };
      addLogoHeader(lbSlide);
      addSectionTitle(lbSlide, 'Performance Ranking');
      const lbRows: PptxGenJS.TableRow[] = [
        ['Rank', 'Counsellor', 'Team', 'Avg Rating', 'Feedback', 'Recommend %'].map(
          (label) =>
            ({
              text: label,
              options: { fill: { color: ACCENT }, color: WHITE, bold: true, fontSize: 10 },
            } as PptxGenJS.TableCell)
        ),
      ];
      leaderboard.slice(0, 10).forEach((entry, idx) => {
        lbRows.push(
          [
            String(idx + 1),
            truncate(entry.name, 28),
            entry.team || '—',
            entry.avg_rating.toFixed(2),
            String(entry.feedback_count),
            `${entry.recommendation_percentage}%`,
          ].map(
            (text) =>
              ({ text: String(text), options: { fontSize: 10, color: TEXT } } as PptxGenJS.TableCell)
          )
        );
      });
      lbSlide.addTable(lbRows, {
        x: 0.5,
        y: 2.2,
        w: 9,
        colW: [0.7, 2.8, 1.5, 1.3, 1.1, 1.3],
        border: { color: BORDER, pt: 0.5 },
        fill: { color: WHITE },
        autoPage: false,
      });
      addFooter(lbSlide, dateStr);
    }
  }

  // ── Student feedback details ──
  const tableRows: PptxGenJS.TableRow[] = [];
  tableRows.push(
    ['Date', 'Student ID', 'Student Name', 'Email', 'Overall', 'Recommend', 'Comments'].map(
      (label) =>
        ({
          text: label,
          options: { fill: { color: DARK_ACCENT }, color: WHITE, bold: true, fontSize: 9 },
        } as PptxGenJS.TableCell)
    )
  );
  for (const f of items) {
    const comment = f.comments ? truncate(String(f.comments), 90) : '—';
    tableRows.push(
      [
        new Date(f.submitted_at).toLocaleDateString('en-IN'),
        f.student_id || '—',
        f.student_name || '—',
        f.student_email || '—',
        f.q10_overall ?? '—',
        f.recommendation ?? '—',
        comment,
      ].map(
        (text) =>
          ({ text: String(text), options: { fontSize: 8, color: TEXT } } as PptxGenJS.TableCell)
      )
    );
  }

  const tableSlide = ppt.addSlide();
  tableSlide.background = { color: WHITE };
  addLogoHeader(tableSlide);
  addSectionTitle(tableSlide, isInstitution ? 'Student Feedback Details' : `${counsellor!.name} — Feedback Details`);
  tableSlide.addTable(tableRows, {
    x: 0.4,
    y: 2.2,
    w: 9.2,
    colW: [1, 1.1, 1.4, 1.8, 0.8, 1.1, 3],
    color: TEXT,
    border: { color: BORDER, pt: 0.5 },
    fill: { color: WHITE },
    autoPage: true,
    autoPageRepeatHeader: true,
    autoPageHeaderRows: 1,
    autoPageLineWeight: 0,
  });
  addFooter(tableSlide, dateStr);

  ppt.writeFile({
    fileName: fileName(counsellor ? counsellor.name.replace(/\s+/g, '_') : 'Institution', 'pptx'),
  });
}
