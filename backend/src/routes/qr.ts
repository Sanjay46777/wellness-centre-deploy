import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const router: Router = Router();

const paramsSchema = z.object({
  counsellorId: z.coerce.number().int().positive(),
});

router.get('/:counsellorId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { counsellorId } = paramsSchema.parse(req.params);
    const { rows } = await query('SELECT id FROM counsellors WHERE id = $1 AND is_active = true', [
      counsellorId,
    ]);
    if (rows.length === 0) {
      throw new AppError(404, 'Counsellor not found');
    }
    const feedbackUrl = `${env.FRONTEND_URL}/feedback?cid=${counsellorId}`;
    res.json({ feedback_url: feedbackUrl, counsellor_id: counsellorId });
  } catch (err) {
    next(err);
  }
});

export default router;
