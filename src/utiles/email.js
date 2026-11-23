import nodemailer from "nodemailer";

export const sendVerificationEmail = async ({
  email,
  username,
  verificationToken,
}) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    const error = new Error(
      "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.",
    );
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const clientUrl =
    process.env.CLIENT_URL ||
    process.env.CLIENT_ORIGIN ||
    "http://localhost:5173";
  const verificationUrl = `${clientUrl.replace(/\/+$/, "")}/verify-email/${encodeURIComponent(
    verificationToken,
  )}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: email,
    subject: "Verify your SkillBridge email",
    text: `Hi ${username}, verify your SkillBridge account using this link: ${verificationUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2>Verify your email</h2>
        <p>Hello,</p>
        <p>Confirm your SkillBridge account by selecting the button below.</p>
        <p style="margin:24px 0">
          <a href="${verificationUrl}"
             style="background:#155b45;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">
            Verify email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};
