import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validate';
import { requireAuthAndRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const router: Router = Router();

router.get(
  '/pending-registrations',
  requireAuthAndRole('admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query(
        `SELECT id, email, full_name, phone, role, created_at
         FROM users
         WHERE role = 'head_counsellor' AND status = 'pending'
         ORDER BY created_at DESC`
      );
      res.json({ registrations: rows });
    } catch (err) {
      next(err);
    }
  }
);

const actionSchema = z.object({
  reason: z.string().optional(),
});

router.post(
  '/approve-registration/:userId',
  requireAuthAndRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query(
        "UPDATE users SET status = 'approved' WHERE id = $1 AND role = 'head_counsellor' AND status = 'pending'",
        [req.params.userId]
      );
      if (result.rowCount === 0) {
        throw new AppError(404, 'Pending registration not found');
      }
      logger.info(`Head counsellor approved: ${req.params.userId}`);
      res.json({ message: 'Registration approved' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/reject-registration/:userId',
  requireAuthAndRole('admin'),
  validateBody(actionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query(
        "UPDATE users SET status = 'rejected' WHERE id = $1 AND role = 'head_counsellor' AND status = 'pending'",
        [req.params.userId]
      );
      if (result.rowCount === 0) {
        throw new AppError(404, 'Pending registration not found');
      }
      logger.info(`Head counsellor rejected: ${req.params.userId}`);
      res.json({ message: 'Registration rejected' });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/students',
  requireAuthAndRole('admin', 'head_counsellor'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query(
        `SELECT id, email, full_name, student_id, phone, created_at
         FROM users
         WHERE role = 'student'
         ORDER BY created_at DESC`
      );
      res.json({ students: rows });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/students/:userId',
  requireAuthAndRole('admin', 'head_counsellor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = $1 AND role = $2',
        [req.params.userId, 'student']
      );
      if (result.rowCount === 0) {
        throw new AppError(404, 'Student not found');
      }
      logger.info(`Student deleted: ${req.params.userId}`);
      res.json({ message: 'Student deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
