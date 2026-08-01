import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/db';
import { validateQuery } from '../middleware/validate';
import { requireAuthAndRole } from '../middleware/auth';
import {
  computeFeedbackStats,
  averageRating,
  recommendationBreakdown,
  FEEDBACK_QUESTIONS,
} from '../services/analytics';

const router: ReturnType<typeof Router> = Router();

const rangeQuerySchema = z.object({
  range: z.enum(['week', 'month', 'all', 'custom']).default('all'),
  start: z.string().optional(),
  end: z.string().optional(),
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
  '/institution',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateQuery(rangeQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range, start, end, team } = req.query as any;
      const dateFilter = buildDateFilter(range, start, end);
      const teamFilter = team ? 'AND c.team = ?' : '';
      const teamParams = team ? [team] : [];

      const [rows] = await pool.execute(
        `SELECT f.*, c.name as counsellor_name, c.designation, c.team, c.id as counsellor_id,
                u.student_id, u.full_name as student_name, u.email as student_email
         FROM feedback f
         JOIN counsellors c ON f.counsellor_id = c.id
         LEFT JOIN users u ON f.user_id = u.id
         WHERE 1=1 ${dateFilter.clause} ${teamFilter}
         ORDER BY f.submitted_at DESC`,
        [...dateFilter.params, ...teamParams]
      );
      const items = rows as any[];
      const stats = computeFeedbackStats(items);

      // Flagged counsellors: avg < 3.2
      const grouped = new Map<number, { id: number; name: string; designation: string | null; team: string | null; items: any[] }>();
      for (const item of items) {
        let g = grouped.get(item.counsellor_id);
        if (!g) {
          g = {
            id: item.counsellor_id,
            name: item.counsellor_name,
            designation: item.designation,
            team: item.team,
            items: [] as any[],
          };
          grouped.set(item.counsellor_id, g);
        }
        g.items.push(item);
      }
      const flagged = Array.from(grouped.values())
        .map((g) => ({
          counsellor_id: g.id,
          name: g.name,
          designation: g.designation,
          team: g.team,
          avg_rating: Number(averageRating(g.items).toFixed(2)),
          feedback_count: g.items.length,
        }))
        .filter((g) => g.avg_rating < 3.2)
        .sort((a, b) => a.avg_rating - b.avg_rating);

      res.json({
        ...stats,
        feedback: items,
        flagged_counsellors: flagged,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/counsellor/:id',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateQuery(rangeQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range, start, end } = req.query as any;
      const dateFilter = buildDateFilter(range, start, end);
      const [cRows] = await pool.execute('SELECT * FROM counsellors WHERE id = ?', [
        req.params.id,
      ]);
      const counsellors = cRows as any[];
      if (counsellors.length === 0) {
        return res.status(404).json({ error: 'Counsellor not found' });
      }
      const [fRows] = await pool.execute(
        `SELECT f.*, c.name as counsellor_name, u.student_id, u.full_name as student_name, u.email as student_email
         FROM feedback f
         JOIN counsellors c ON f.counsellor_id = c.id
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.counsellor_id = ? ${dateFilter.clause}
         ORDER BY f.submitted_at DESC`,
        [req.params.id, ...dateFilter.params]
      );
      const items = fRows as any[];
      const stats = computeFeedbackStats(items);
      res.json({
        counsellor: counsellors[0],
        ...stats,
        feedback: items,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/leaderboard',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateQuery(rangeQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range, start, end, team } = req.query as any;
      const dateFilter = buildDateFilter(range, start, end);
      const teamFilter = team ? 'AND c.team = ?' : '';
      const teamParams = team ? [team] : [];

      const [rows] = await pool.execute(
        `SELECT f.*, c.name as counsellor_name, c.designation, c.team, c.id as counsellor_id
         FROM feedback f
         JOIN counsellors c ON f.counsellor_id = c.id
         WHERE 1=1 ${dateFilter.clause} ${teamFilter}`,
        [...dateFilter.params, ...teamParams]
      );
      const items = rows as any[];
      const grouped = new Map<number, { id: number; name: string; designation: string | null; team: string | null; items: any[] }>();
      for (const item of items) {
        let g = grouped.get(item.counsellor_id);
        if (!g) {
          g = {
            id: item.counsellor_id,
            name: item.counsellor_name,
            designation: item.designation,
            team: item.team,
            items: [] as any[],
          };
          grouped.set(item.counsellor_id, g);
        }
        g.items.push(item);
      }

      const leaderboard = Array.from(grouped.values())
        .map((g) => {
          const rec = recommendationBreakdown(g.items);
          return {
            counsellor_id: g.id,
            name: g.name,
            designation: g.designation,
            team: g.team,
            avg_rating: Number(averageRating(g.items).toFixed(2)),
            feedback_count: g.items.length,
            recommendation_percentage: rec.yesPct,
          };
        })
        .sort((a, b) => b.avg_rating - a.avg_rating);

      res.json({ leaderboard });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
