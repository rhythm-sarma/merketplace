import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.in",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL on port 465
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Send an email using Zoho SMTP.
 * Failures are logged but never thrown — emails should never crash the main API flow.
 */
export async function sendMail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[MAIL] SMTP credentials not configured — skipping email.");
      return;
    }

    await transporter.sendMail({
      from: `"Racksup" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[MAIL] Sent "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[MAIL] Failed to send "${subject}" to ${to}:`, error);
  }
}

/**
 * Fire-and-forget email — doesn't await the send.
 * Use for non-critical emails like login notifications.
 */
export function sendMailAsync(to: string, subject: string, html: string) {
  sendMail(to, subject, html).catch(() => {});
}
