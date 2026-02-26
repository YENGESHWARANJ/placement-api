import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────
// Transporter — uses Gmail SMTP (set SMTP_* in .env)
// Falls back to Ethereal (test mail) if not configured
// ─────────────────────────────────────────────────────────────
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("[EMAIL] Using SMTP transporter:", process.env.SMTP_HOST);
  } else {
    // Dev fallback: Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("[EMAIL] ⚠  No SMTP configured — using Ethereal test mail.");
    console.log("[EMAIL] Preview emails at: https://ethereal.email/messages");
  }

  return transporter;
}

const FROM = process.env.SMTP_FROM || "PlacementCell <noreply@placementcell.app>";

// ─────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────
function baseTemplate(title: string, body: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
      <tr><td align="center">
        <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">🎓 PlacementCell</h1>
            <p style="color:#bfdbfe;margin:6px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">${title}</p>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:36px 40px;">
            ${body}
          </td></tr>
          <!-- Footer -->
          <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:11px;margin:0;">This email was sent by PlacementCell portal. Do not reply.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

// ─────────────────────────────────────────────────────────────
// Send OTP Verification Email
// ─────────────────────────────────────────────────────────────
export async function sendOTPEmail(to: string, name: string, otp: string) {
  const t = await getTransporter();
  const body = `
    <h2 style="color:#0f172a;margin:0 0 8px;font-size:20px;font-weight:800;">Verify Your Email</h2>
    <p style="color:#475569;margin:0 0 28px;line-height:1.6;">Hi <strong>${name}</strong>, use the OTP below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
    <div style="background:#f0f9ff;border:2px dashed #3b82f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Your One-Time Password</p>
      <h1 style="color:#1d4ed8;font-size:48px;font-weight:900;margin:0;letter-spacing:12px;">${otp}</h1>
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:0;">If you didn't request this, please ignore this email.</p>`;

  const info = await t.sendMail({ from: FROM, to, subject: `${otp} — Your PlacementCell verification code`, html: baseTemplate("Email Verification", body) });
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n-----------------------------------------`);
    console.log(`[DEV ONLY] OTP for ${to}: ${otp}`);
    console.log(`[EMAIL] Preview: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`-----------------------------------------\n`);
  }
}

// ─────────────────────────────────────────────────────────────
// Send Login Notification Email
// ─────────────────────────────────────────────────────────────
export async function sendLoginNotificationEmail(to: string, name: string, time: string, ip?: string) {
  try {
    const t = await getTransporter();
    const body = `
      <h2 style="color:#0f172a;margin:0 0 8px;font-size:20px;font-weight:800;">New Login Detected</h2>
      <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi <strong>${name}</strong>, we noticed a new login to your PlacementCell account.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <tr><td style="padding:6px 0;"><span style="color:#64748b;font-size:12px;">Time:</span><br><strong style="color:#0f172a;">${time}</strong></td></tr>
        ${ip ? `<tr><td style="padding:6px 0;"><span style="color:#64748b;font-size:12px;">IP Address:</span><br><strong style="color:#0f172a;">${ip}</strong></td></tr>` : ""}
      </table>
      <p style="color:#ef4444;font-weight:700;margin:0 0 8px;">If this wasn't you, change your password immediately.</p>
      <p style="color:#94a3b8;font-size:12px;margin:0;">If this was you, you can safely ignore this email.</p>`;

    await t.sendMail({ from: FROM, to, subject: "New login to your PlacementCell account", html: baseTemplate("Security Alert", body) });
  } catch (err) {
    console.warn("[EMAIL] Failed to send login notification:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// Send Password Reset Email
// ─────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const t = await getTransporter();
  const body = `
    <h2 style="color:#0f172a;margin:0 0 8px;font-size:20px;font-weight:800;">Reset Your Password</h2>
    <p style="color:#475569;margin:0 0 28px;line-height:1.6;">Hi <strong>${name}</strong>, click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;">Reset Password</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:0;">Or copy this link: <span style="color:#2563eb;">${resetUrl}</span></p>`;

  const info = await t.sendMail({ from: FROM, to, subject: "Reset your PlacementCell password", html: baseTemplate("Password Reset", body) });
  if (process.env.NODE_ENV !== "production") {
    console.log(`[EMAIL] Reset link sent | Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
