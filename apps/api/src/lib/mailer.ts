import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      logger.info('✅ Mailer: Transporter nodemailer berhasil dibuat');
    }
  }
  return transporter;
};

export const sendMail = async (options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> => {
  const mailTransporter = getTransporter();
  const from = env.EMAIL_FROM || '"Tokoify" <noreply@tokoify.com>';

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info(`✉️ Mailer: Email berhasil terkirim ke ${options.to}`);
      return;
    } catch (err) {
      logger.error(`❌ Mailer: Gagal mengirim email ke ${options.to}:`, err);
    }
  }

  // Fallback: log email details to console
  logger.info('\n=================== MOCK EMAIL ===================');
  logger.info(`FROM: ${from}`);
  logger.info(`TO: ${options.to}`);
  logger.info(`SUBJECT: ${options.subject}`);
  logger.info(`TEXT CONTENT:\n${options.text}`);
  logger.info('==================================================\n');
};
