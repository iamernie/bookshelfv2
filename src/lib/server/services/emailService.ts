/**
 * Email Service
 * Handles sending emails for password resets, notifications, etc.
 * Uses nodemailer with configurable SMTP settings.
 */

import nodemailer from 'nodemailer';
import { createLogger } from './loggerService';

const log = createLogger('email');

interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	user: string;
	pass: string;
	from: string;
}

function getEmailConfig(): EmailConfig | null {
	const host = process.env.SMTP_HOST;
	const port = parseInt(process.env.SMTP_PORT || '587', 10);
	const secure = process.env.SMTP_SECURE === 'true';
	const user = process.env.SMTP_USER || '';
	const pass = process.env.SMTP_PASS || '';
	const from = process.env.SMTP_FROM || 'BookShelf <noreply@bookshelf.local>';

	if (!host) {
		return null;
	}

	return { host, port, secure, user, pass, from };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
	if (transporter) {
		return transporter;
	}

	const config = getEmailConfig();
	if (!config) {
		log.warn('SMTP not configured - email features disabled');
		return null;
	}

	transporter = nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: config.user
			? {
					user: config.user,
					pass: config.pass
				}
			: undefined
	});

	return transporter;
}

export function isEmailConfigured(): boolean {
	return getEmailConfig() !== null;
}

export async function sendEmail(
	to: string,
	subject: string,
	html: string,
	text?: string
): Promise<boolean> {
	const transport = getTransporter();
	const config = getEmailConfig();

	if (!transport || !config) {
		log.warn('Email not sent - SMTP not configured', { to, subject });
		return false;
	}

	try {
		await transport.sendMail({
			from: config.from,
			to,
			subject,
			html,
			text: text || html.replace(/<[^>]*>/g, '')
		});
		log.info('Email sent successfully', { to, subject });
		return true;
	} catch (error) {
		log.error('Failed to send email', { to, subject, error });
		return false;
	}
}

export async function sendPasswordResetEmail(
	email: string,
	resetToken: string,
	baseUrl: string
): Promise<boolean> {
	const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">BookShelf</h1>
  </div>

  <h2 style="color: #1f2937;">Reset Your Password</h2>

  <p>We received a request to reset your password. Click the button below to create a new password:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}"
       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Reset Password
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
  </p>

  <p style="color: #6b7280; font-size: 14px;">
    If the button doesn't work, copy and paste this URL into your browser:<br>
    <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    This email was sent from your BookShelf instance.
  </p>
</body>
</html>
`;

	const text = `
Reset Your Password

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
`;

	return sendEmail(email, 'Reset Your BookShelf Password', html, text);
}

export async function sendVerificationEmail(
	email: string,
	verificationToken: string,
	baseUrl: string
): Promise<boolean> {
	const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">BookShelf</h1>
  </div>

  <h2 style="color: #1f2937;">Verify Your Email Address</h2>

  <p>Welcome to BookShelf! Please verify your email address by clicking the button below:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyUrl}"
       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Verify Email
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
  </p>

  <p style="color: #6b7280; font-size: 14px;">
    If the button doesn't work, copy and paste this URL into your browser:<br>
    <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    This email was sent from your BookShelf instance.
  </p>
</body>
</html>
`;

	const text = `
Verify Your Email Address

Welcome to BookShelf! Please verify your email address by visiting the link below:

${verifyUrl}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
`;

	return sendEmail(email, 'Verify Your BookShelf Email', html, text);
}

export async function sendWelcomeEmail(
	email: string,
	username: string,
	baseUrl: string
): Promise<boolean> {
	const loginUrl = `${baseUrl}/login`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">BookShelf</h1>
  </div>

  <h2 style="color: #1f2937;">Welcome to BookShelf, ${username}!</h2>

  <p>Your email has been verified and your account is now active. You can start using BookShelf to organize and track your reading.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${loginUrl}"
       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Sign In to BookShelf
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    Happy reading!
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    This email was sent from your BookShelf instance.
  </p>
</body>
</html>
`;

	const text = `
Welcome to BookShelf, ${username}!

Your email has been verified and your account is now active. You can start using BookShelf to organize and track your reading.

Sign in at: ${loginUrl}

Happy reading!
`;

	return sendEmail(email, 'Welcome to BookShelf!', html, text);
}
