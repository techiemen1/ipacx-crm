"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUoms() {
    try {
        const uoms = await prisma.unitOfMeasure.findMany({
            include: {
                conversionsFrom: { include: { toUom: true } },
                conversionsTo: { include: { fromUom: true } }
            },
            orderBy: { name: 'asc' }
        })
        return { data: uoms }
    } catch (e) {
        return { error: "Failed to fetch units" }
    }
}

export async function createUom(data: { name: string; symbol: string; type: string; baseConversion?: number }) {
    try {
        await prisma.unitOfMeasure.create({ data })
        revalidatePath("/admin/inventory/settings") // Hypothetical path
        return { success: true }
    } catch (e) {
        return { error: "Failed to create unit" }
    }
}

export async function updateUom(id: string, data: { name: string; symbol: string; type: string; baseConversion?: number }) {
    try {
        await prisma.unitOfMeasure.update({ where: { id }, data })
        revalidatePath("/admin/inventory/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to update unit" }
    }
}

export async function deleteUom(id: string) {
    try {
        await prisma.unitOfMeasure.delete({ where: { id } })
        revalidatePath("/admin/inventory/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete unit" }
    }
}

export async function createConversion(data: { fromUomId: string; toUomId: string; factor: number }) {
    try {
        await prisma.uomConversion.create({ data })
        revalidatePath("/admin/inventory/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create conversion" }
    }
}

export async function deleteConversion(id: string) {
    try {
        await prisma.uomConversion.delete({ where: { id } })
        revalidatePath("/admin/inventory/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete conversion" }
    }
}
