"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function logAction(action: string, module: string, description: string) {
    const session = await auth()
    const userId = session?.user?.id

    try {
        await prisma.internalLog.create({
            data: {
                action,
                module,
                description,
                userId: userId || null
            }
        })
    } catch (error) {
        console.error("Failed to create audit log:", error)
        // Non-blocking error - logs shouldn't crash the app
    }
}

export async function getLogs(limit = 100) {
    try {
        const logs = await prisma.internalLog.findMany({
            orderBy: { timestamp: "desc" },
            take: limit,
            include: {
                user: { select: { name: true, email: true } }
            }
        })
        return { success: true, data: logs }
    } catch (error) {
        return { error: "Failed to fetch logs" }
    }
}

export async function deleteOldLogs(days: number) {
    const session = await auth()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any).role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    const date = new Date()
    date.setDate(date.getDate() - days)

    try {
        const { count } = await prisma.internalLog.deleteMany({
            where: {
                timestamp: { lt: date }
            }
        })

        // Self-logging
        await logAction("DELETE_LOGS", "SYSTEM", `Deleted ${count} logs older than ${days} days`)

        revalidatePath("/admin/settings")
        return { success: true, count }
    } catch (error) {
        return { error: "Failed to delete logs" }
    }
}
