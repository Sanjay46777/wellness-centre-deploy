import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validate';
import { requireAuthAndRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const router: ReturnType<typeof Router> = Router();

const counsellorSchema = z.object({
  name: z.string().min(1),
  designation: z.string().optional(),
  team: z.string().optional(),
  specialization: z.string().optional(),
  email: z.string().email().optional(),
  is_active: z.boolean().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const active = req.query.active;
    const search = (req.query.search as string) || '';
    const team = (req.query.team as string) || '';
    let sql = 'SELECT * FROM counsellors WHERE 1=1';
    const params: any[] = [];
    if (active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(active === 'true');
    }
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (team) {
      sql += ' AND team = ?';
      params.push(team);
    }
    sql += ' ORDER BY name';
    const [rows] = await pool.execute(sql, params);
    res.json({ counsellors: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM counsellors WHERE id = ?', [
      req.params.id,
    ]);
    const counsellors = rows as any[];
    if (counsellors.length === 0) throw new AppError(404, 'Counsellor not found');
    res.json({ counsellor: counsellors[0] });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateBody(counsellorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, designation, team, specialization, email } = req.body;
      const [result] = await pool.execute(
        `INSERT INTO counsellors (name, designation, team, specialization, email, is_active)
         VALUES (?, ?, ?, ?, ?, true)`,
        [name, designation || null, team || null, specialization || null, email || null]
      );
      const id = (result as any).insertId;
      logger.info(`Counsellor created: ${name}`);
      res.status(201).json({ message: 'Counsellor created', counsellor_id: id });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  requireAuthAndRole('admin', 'head_counsellor'),
  validateBody(counsellorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, designation, team, specialization, email, is_active } = req.body;
      const [result] = await pool.execute(
        `UPDATE counsellors
         SET name = ?, designation = ?, team = ?, specialization = ?, email = ?, is_active = ?
         WHERE id = ?`,
        [
          name,
          designation || null,
          team || null,
          specialization || null,
          email || null,
          is_active ?? true,
          req.params.id,
        ]
      );
      if ((result as any).affectedRows === 0) {
        throw new AppError(404, 'Counsellor not found');
      }
      logger.info(`Counsellor updated: ${req.params.id}`);
      res.json({ message: 'Counsellor updated' });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuthAndRole('admin', 'head_counsellor'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [result] = await pool.execute('DELETE FROM counsellors WHERE id = ?', [
      req.params.id,
    ]);
    if ((result as any).affectedRows === 0) {
      throw new AppError(404, 'Counsellor not found');
    }
    logger.info(`Counsellor deleted: ${req.params.id}`);
    res.json({ message: 'Counsellor deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
