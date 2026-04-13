import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.zoho.in",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // SSL on port 465
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
      // Connection pooling — reuse TCP connections for multiple sends
      pool: true,
      maxConnections: 3,
    });
  }
  return transporter;
}

/**
 * Send an email using Zoho SMTP.
 * Failures are logged but never thrown — emails should never crash the main API flow.
 *
 * Anti-spam measures applied here:
 * 1. "From" display name matches the domain brand exactly (no stuffing keywords)
 * 2. envelope.from is set explicitly so Zoho can align SPF with the header From
 * 3. Message-ID uses our own domain (racksup.in) — prevents Zoho's generic
 *    Message-ID from causing DMARC alignment mismatches
 * 4. replyTo matches the From address — signals to receivers this is a real mailbox
 * 5. No X-Entity-Ref-ID or unusual custom headers that spam filters flag
 */
export async function sendMail(to: string, subject: string, html: string, text?: string) {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn("[MAIL] SMTP credentials not configured — skipping email.");
      return;
    }

    const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@racksup.in>`;

    await getTransporter().sendMail({
      from: {
        name: "Racksup",
        address: smtpUser,
      },
      sender: smtpUser,
      replyTo: smtpUser,
      to,
      subject,
      html,
      text,
      messageId,
      headers: {
        // Auto-Submitted signals this is a legitimate automated transactional email
        "Auto-Submitted": "auto-generated",
        // X-Mailer — clean identifier, signals a legitimate sending system
        "X-Mailer": "Racksup Transactional v1.0",
        // List-Unsubscribe — Gmail requires this for bulk senders (Feb 2024 guidelines);
        // even for transactional mail it improves deliverability signals
        "List-Unsubscribe": `<mailto:${smtpUser}?subject=unsubscribe>`,
      },
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
export function sendMailAsync(to: string, subject: string, html: string, text?: string) {
  sendMail(to, subject, html, text).catch(() => {});
}
