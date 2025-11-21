// lib/email.ts
import nodemailer from "nodemailer";

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_EMAIL;

if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    throw new Error("Missing SMTP credentials in env (SMTP_EMAIL / SMTP_PASSWORD).");
}

export const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    }
});


export async function sendCredentialsEmail(to: string, password: string, name: string) {
    const html = `
      <p>Hello <strong>${name}</strong>,</p>

      <p>Your student registration has been <strong>approved</strong> and your online account has been created.</p>

      <p><strong>Login Details</strong><br/>
         Email: <strong>${to}</strong><br/>
         Temporary Password: <strong>${password}</strong>
      </p>

      <p>Please log in immediately and change your password.</p>

      <p>— WLC Ormoc Administration</p>
    `;

    await mailer.sendMail({
        from: SMTP_FROM,
        to,
        subject: "Your WLC Ormoc Student Portal Credentials",
        text: `Your account has been approved.\nEmail: ${to}\nTemporary Password: ${password}`,
        html,
    });
}
