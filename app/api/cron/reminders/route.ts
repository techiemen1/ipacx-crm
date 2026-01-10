
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mail"
import { NextResponse } from "next/server"

// This route should be protected or called via a secure job
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // 1. Find overdue invoices (Due Date passed, Not Paid)
        const today = new Date()
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: { not: "Paid" },
                dueDate: { lt: today },
                paymentStatus: { not: "Paid" } // Redundant but safe
            },
            include: {
                customer: true
            }
        })

        console.log(`[REMINDER] Found ${overdueInvoices.length} overdue invoices`)

        let sentCount = 0
        const errors = []

        // 2. Iterate and send emails
        for (const invoice of overdueInvoices) {
            if (invoice.customer && invoice.customer.email) {
                const message = `
                    <h1>Payment Reminder</h1>
                    <p>Dear ${invoice.customer.name},</p>
                    <p>This is a friendly reminder that Invoice <strong>${invoice.invoiceNo}</strong> for <strong>₹${invoice.totalAmount}</strong> was due on ${invoice.dueDate.toLocaleDateString()}.</p>
                    <p>Please arrange for payment at your earliest convenience.</p>
                    <p>Thank you.</p>
                `

                const result = await sendEmail({
                    to: invoice.customer.email,
                    subject: `Overdue Invoice: ${invoice.invoiceNo}`,
                    html: message
                })

                if (result.success) sentCount++
                else errors.push({ invoice: invoice.invoiceNo, error: result.error })
            } else {
                console.log(`[REMINDER] Skipping Invoice ${invoice.invoiceNo} - No customer email`)
            }
        }

        return NextResponse.json({
            success: true,
            processed: overdueInvoices.length,
            sent: sentCount,
            errors
        })

    } catch (error) {
        console.error("[REMINDER] Job Failed:", error)
        return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
}
