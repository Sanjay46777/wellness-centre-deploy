import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { validateBody } from '../middleware/validate';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router: Router = Router();

const feedbackSchema = z.object({
  counsellor_id: z.number().int(),
  q1_comfort: z.number().int().min(1).max(5),
  q2_understood: z.number().int().min(1).max(5),
  q3_time: z.number().int().min(1).max(5),
  q4_quality: z.number().int().min(1).max(5),
  q5_respected: z.number().int().min(1).max(5),
  q6_supported: z.number().int().min(1).max(5),
  q7_hopeful: z.number().int().min(1).max(5),
  q8_safe: z.number().int().min(1).max(5),
  q9_communication: z.number().int().min(1).max(5),
  q10_overall: z.number().int().min(1).max(5),
  recommendation: z.enum(['Yes', 'No', 'Maybe']).optional().nullable(),
  comments: z.string().optional(),
  is_anonymous: z.boolean().default(true),
  respondent_email: z.string().email().optional().nullable(),
});

router.post(
  '/',
  authenticate,
  authorize('student'),
  validateBody(feedbackSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const {
        counsellor_id,
        q1_comfort,
        q2_understood,
        q3_time,
        q4_quality,
        q5_respected,
        q6_supported,
        q7_hopeful,
        q8_safe,
        q9_communication,
        q10_overall,
        recommendation,
        comments,
        is_anonymous,
        respondent_email,
      } = req.body;

      const user_id = req.user!.id;
      const email = is_anonymous ? null : respondent_email || req.user!.email || null;

      const result = await query(
        `INSERT INTO feedback (
          counsellor_id, user_id, q1_comfort, q2_understood, q3_time, q4_quality, q5_respected,
          q6_supported, q7_hopeful, q8_safe, q9_communication, q10_overall,
          recommendation, comments, is_anonymous, respondent_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
          counsellor_id,
          user_id,
          q1_comfort,
          q2_understood,
          q3_time,
          q4_quality,
          q5_respected,
          q6_supported,
          q7_hopeful,
          q8_safe,
          q9_communication,
          q10_overall,
          recommendation || null,
          comments || null,
          is_anonymous,
          email,
        ]
      );
      logger.info(`Feedback submitted for counsellor ${counsellor_id}`);
      res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback_id: result.rows[0].id,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/my-history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await query(
      `SELECT f.*, c.name AS counsellor_name
       FROM feedback f
       JOIN counsellors c ON f.counsellor_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.submitted_at DESC`,
      [req.user!.id]
    );
    res.json({ feedback: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
