import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to, name, token) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return;

  const verifyUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: `"Wizago Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your Wizago Shop account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border:2px solid #121212;padding:2rem">
        <div style="background:#ffde47;border:2px solid #121212;padding:0.5rem 1rem;display:inline-block;font-weight:700;text-transform:uppercase;margin-bottom:1.5rem">
          Wizago Shop
        </div>
        <h1 style="text-transform:uppercase;font-size:1.5rem">Welcome, ${name}!</h1>
        <p style="color:#5a5a5a;line-height:1.6">Click the big button below to verify your email and activate your wizard account.</p>
        <a href="${verifyUrl}" style="display:block;text-align:center;margin:2rem 0;padding:1rem;background:#121212;color:#fff;text-decoration:none;text-transform:uppercase;font-weight:700;border:2px solid #121212;letter-spacing:1px">
          Verify Email
        </a>
        <p style="font-size:0.8rem;color:#888">Or paste this link in your browser:<br><span style="color:#121212">${verifyUrl}</span></p>
        <p style="margin-top:1.5rem;font-size:0.75rem;color:#888;text-transform:uppercase">May your spells remain strong. Wizago Compliant.</p>
      </div>
    `,
  });
}