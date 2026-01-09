"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Pipelines & Stages ---

export async function getPipelines() {
    try {
        const pipelines = await prisma.cRMPipeline.findMany({
            include: { stages: { orderBy: { order: 'asc' } } }
        })

        // Seed default if none
        if (pipelines.length === 0) {
            await createDefaultPipeline()
            return await prisma.cRMPipeline.findMany({
                include: { stages: { orderBy: { order: 'asc' } } }
            })
        }

        return pipelines
    } catch (e) {
        return []
    }
}

async function createDefaultPipeline() {
    const pipeline = await prisma.cRMPipeline.create({
        data: { name: "Standard Sales Pipeline", isDefault: true }
    })

    const stages = [
        { name: "New", order: 0, color: "#3b82f6", pipelineId: pipeline.id },
        { name: "Contacted", order: 1, color: "#eab308", pipelineId: pipeline.id },
        { name: "Proposal", order: 2, color: "#a855f7", pipelineId: pipeline.id },
        { name: "Won", order: 3, color: "#22c55e", pipelineId: pipeline.id },
        { name: "Lost", order: 4, color: "#ef4444", pipelineId: pipeline.id }
    ]

    for (const stage of stages) {
        await prisma.cRMStage.create({ data: stage })
    }
}

// --- Deals ---

export async function getDeals(pipelineId?: string) {
    try {
        const where = pipelineId
            ? { stage: { pipelineId } }
            : {}

        return await prisma.cRMDeal.findMany({
            where,
            include: {
                stage: true,
                customer: true,
                assignee: true,
                activities: { orderBy: { date: 'desc' }, take: 1 }
            },
            orderBy: { updatedAt: 'desc' }
        })
    } catch {
        return []
    }
}

export async function createDeal(data: {
    title: string, value: number, customerId: string, stageId: string, expectedCloseDate?: Date
}) {
    try {
        await prisma.cRMDeal.create({
            data: {
                title: data.title,
                value: data.value,
                customerId: data.customerId,
                stageId: data.stageId,
                expectedCloseDate: data.expectedCloseDate,
                status: "Open"
            }
        })
        revalidatePath("/admin/crm")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create deal" }
    }
}

export async function updateDealStage(dealId: string, stageId: string) {
    try {
        await prisma.cRMDeal.update({
            where: { id: dealId },
            data: { stageId }
        })
        revalidatePath("/admin/crm")
        return { success: true }
    } catch (e) {
        return { error: "Failed to move deal" }
    }
}

export async function deleteDeals(ids: string[]) {
    try {
        await prisma.cRMDeal.deleteMany({
            where: { id: { in: ids } }
        })
        revalidatePath("/admin/crm")
        return { success: true }
    } catch {
        return { error: "Failed to delete deals" }
    }
}

// --- Activities ---

export async function createActivity(data: {
    type: string, subject: string, description?: string, dealId?: string, customerId?: string, userId: string
}) {
    try {
        await prisma.activity.create({
            data
        })
        revalidatePath("/admin/crm")
        return { success: true }
    } catch (e) {
        return { error: "Failed to log activity" }
    }
}
