import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

const router: ReturnType<typeof Router> = Router();

router.get('/:counsellorId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedbackUrl = `${env.FRONTEND_URL}/feedback?cid=${req.params.counsellorId}`;
    res.json({ feedback_url: feedbackUrl, counsellor_id: req.params.counsellorId });
  } catch (err) {
    next(err);
  }
});

export default router;
