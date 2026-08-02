import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { validateQuery } from '../middleware/validate';
import { requireAuthAndRole } from '../middleware/auth';
import { exportPPT, exportPDF, exportExcel } from '../services/export';

const router: Router = Router();

const querySchema = z.object({
  format: z.enum(['ppt', 'pdf', 'excel']),
  range: z.enum(['week', 'month', 'all', 'custom']).default('all'),
  start: z.string().optional(),
  end: z.string().optional(),
  counsellor_id: z.string().optional(),
  team: z.string().optional(),
});

function buildDateFilter(range: string, start?: string, end?: string) {
  if (range === 'all') return { clause: '', params: [] as any[] };
  if (range === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return { clause: 'AND f.submitted_at >= ?', params: [d.toISOString()] };
  }
  if (range === 'month') {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { clause: 'AND f.submitted_at >= ?', params: [d.toISOString()] };
  }
  if (range === 'custom' && start && end) {
    return { clause: 'AND f.submitted_at BETWEEN ? AND ?', params: [start, end] };
  }
  return { clause: '', params: [] };
}

router.get(
  '/',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateQuery(querySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format, range, start, end, counsellor_id, team } = req.query as any;
      const dateFilter = buildDateFilter(range, start, end);
      const counsellorFilter = counsellor_id ? 'AND f.counsellor_id = ?' : '';
      const teamFilter = team ? 'AND c.team = ?' : '';
      const params: any[] = [];
      if (counsellor_id) params.push(counsellor_id);
      params.push(...dateFilter.params);
      if (team) params.push(team);

      const { rows } = await query(
        `SELECT f.*, c.name as counsellor_name, u.student_id, u.full_name as student_name, u.email as student_email
         FROM feedback f
         JOIN counsellors c ON f.counsellor_id = c.id
         LEFT JOIN users u ON f.user_id = u.id
         WHERE 1=1 ${counsellorFilter} ${dateFilter.clause} ${teamFilter}
         ORDER BY f.submitted_at DESC`,
        params
      );
      const items = rows as any[];
      const counsellorName = counsellor_id ? items[0]?.counsellor_name : undefined;
      const prefix = counsellorName ? counsellorName.replace(/\s+/g, '_') : 'Institution';

      if (format === 'ppt') {
        const buffer = await exportPPT(items, counsellorName);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${prefix}_feedback_${new Date().toISOString().slice(0, 10)}.pptx"`
        );
        return res.send(buffer);
      }

      if (format === 'pdf') {
        const buffer = exportPDF(items, counsellorName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${prefix}_feedback_${new Date().toISOString().slice(0, 10)}.pdf"`
        );
        return res.send(buffer);
      }

      const buffer = exportExcel(items, counsellorName);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${prefix}_feedback_${new Date().toISOString().slice(0, 10)}.xlsx"`
      );
      return res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
