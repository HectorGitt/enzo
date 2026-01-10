'use server';

import nodemailer from 'nodemailer';
import { auth } from '@/auth';

export type FeedbackType = 'feature' | 'bug';

export interface FeedbackData {
    type: FeedbackType;
    title: string;
    description: string;
    email: string; // Contact email
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"Enzo Feedback" <noreply@enzo.dev>';
const RECIPIENT_EMAIL = process.env.FEEDBACK_RECIPIENT_EMAIL || SMTP_USER; // Default to sender if not set

export async function sendFeedbackAction(data: FeedbackData) {
    const session = await auth();
    // @ts-ignore
    const userEmail = session?.user?.email;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("Missing SMTP Configuration");
        return { success: false, error: "Email service not configured." };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const subjectPrefix = data.type === 'bug' ? '🐛 [BUG]' : '💡 [FEATURE]';
        const subject = `${subjectPrefix} ${data.title}`;

        const htmlContent = `
            <h2>New Feedback Received</h2>
            <p><strong>Type:</strong> ${data.type.toUpperCase()}</p>
            <p><strong>Submitted By:</strong> ${data.email} ${userEmail ? `(Auth: ${userEmail})` : ''}</p>
            <hr />
            <h3>${data.title}</h3>
            <p style="white-space: pre-wrap;">${data.description}</p>
            <hr />
            <p><small>Sent from Enzo Dashboard</small></p>
        `;

        await transporter.sendMail({
            from: SMTP_FROM,
            to: RECIPIENT_EMAIL,
            replyTo: data.email,
            subject: subject,
            html: htmlContent,
            text: `Type: ${data.type}\nTitle: ${data.title}\nDescription: ${data.description}\nFrom: ${data.email}`
        });

        return { success: true };
    } catch (error: any) {
        console.error("Feedback Email Failed:", error);
        return { success: false, error: "Failed to send email. Please try again later." };
    }
}
