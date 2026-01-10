
import nodemailer from "nodemailer"

// Configure SMTP transport
// For development, we'll use a placeholder or look for env vars.
// For production, the user needs to provide SMTP_HOST, SMTP_USER, etc.
const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASS || "password"
    }
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.SMTP_USER) {
        console.warn("[MAIL] No SMTP configuration found. Skipping email send.")
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`)
        return { success: false, error: "SMTP not configured" }
    }

    try {
        const info = await transport.sendMail({
            from: process.env.SMTP_FROM || '"Admin" <noreply@example.com>',
            to,
            subject,
            html
        })
        console.log("[MAIL] Message sent: %s", info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("[MAIL] Error sending email:", error)
        return { success: false, error }
    }
}
