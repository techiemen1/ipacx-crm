"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function logCommunication(data: {
    subject: string
    body: string
    recipientType: string
    recipientId: string
    status: string
}) {
    try {
        await prisma.communicationLog.create({
            data: {
                subject: data.subject,
                body: data.body,
                recipientType: data.recipientType,
                recipientId: data.recipientId,
                status: data.status,
                // sentBy: userId // TODO: Add auth context
            }
        })
        revalidatePath("/admin/communications")
        return { success: true }
    } catch {
        return { error: "Failed to log message" }
    }
}

export async function getCommunicationLogs() {
    try {
        return await prisma.communicationLog.findMany({
            orderBy: { sentAt: 'desc' }
        })
    } catch {
        return []
    }
}

export async function getRecipients() {
    const customers = await prisma.customer.findMany({ select: { id: true, name: true, email: true, phone: true } })
    const vendors = await prisma.vendor.findMany({ select: { id: true, name: true, email: true, phone: true } })
    const employees = await prisma.user.findMany({ select: { id: true, name: true, email: true } }) // User as Employee

    const all = [
        ...customers.map(c => ({ ...c, type: 'Customer', name: c.name || "Unknown", email: c.email || "", phone: c.phone || "" })),
        ...vendors.map(v => ({ ...v, type: 'Vendor', name: v.name || "Unknown", email: v.email || "", phone: v.phone || "" })),
        ...employees.map(e => ({ ...e, type: 'Employee', name: e.name || "Unknown", email: e.email || "", phone: "" }))
    ]

    return all
}
