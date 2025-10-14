import nodemailer from 'nodemailer';

interface AdminEmailParams {
  subject: string;
  html: string;
  text: string;
}

export async function sendAdminNotification(params: AdminEmailParams): Promise<boolean> {
  try {
    const smtpUser = process.env.DREAMHOST_SMTP_USER;
    const smtpPass = process.env.DREAMHOST_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("DreamHost SMTP credentials not configured - email will not be sent");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.dreamhost.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"UGGA Platform" <${smtpUser}>`,
      to: 'admins@greenhousegrowers.org',
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    console.log(`Admin notification sent successfully: ${params.subject}`);
    return true;
  } catch (error) {
    console.error('DreamHost SMTP error:', error);
    return false;
  }
}
