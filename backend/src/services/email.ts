import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function createTransporter() {
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!transporter) {
    transporter = createTransporter();
  }

  const from = env.SMTP_FROM || 'Wellness Centre <wellness@smail.iitm.ac.in>';

  if (!transporter) {
    logger.info(`[EMAIL] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    logger.info(`Email sent to ${message.to}`);
  } catch (err) {
    logger.error('Email sending failed', err);
    throw new Error('Failed to send email');
  }
}

export function getResetUrl(token: string): string {
  return `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
}
