import nodemailer from 'nodemailer';

interface UserEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendUserEmail(params: UserEmailParams): Promise<boolean> {
  try {
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("Brevo SMTP credentials not configured - email will not be sent");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: '"UGGA Platform" <noreply@greenhousegrowers.org>',
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    console.log(`User email sent successfully to ${params.to}: ${params.subject}`);
    return true;
  } catch (error) {
    console.error('Brevo SMTP error:', error);
    return false;
  }
}
