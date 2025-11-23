import nodemailer from "nodemailer";
import { config } from 'dotenv';
config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

transporter.sendMail({
    from: process.env.SMTP_FROM,        // Sender name & email
    to: "princerobengloria@gmail.com",       // Test recipient
    subject: "Test Email",              // Email subject
    text: "This is a test",             // Plain text body
}).then(() => console.log("Email sent!"))
    .catch(err => console.error("Failed:", err));

console.log(
    'SMTP_EMAIL:', process.env.SMTP_EMAIL,
    'SMTP_PASSWORD:', process.env.SMTP_PASSWORD,
    'SMTP_FROM:', process.env.SMTP_FROM
);
