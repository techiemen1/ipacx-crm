"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taxRateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    rate: z.coerce.number().min(0),
    cgst: z.coerce.number().min(0),
    sgst: z.coerce.number().min(0),
    igst: z.coerce.number().min(0),
    type: z.enum(["GST", "TDS", "TCS", "VAT"])
})

export async function createTaxRate(data: unknown) {
    const validated = taxRateSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.taxRate.create({
            data: validated.data
        })
        revalidatePath("/admin/accounts/taxes")
        return { success: true }
    } catch {
        return { error: "Failed to create tax rate" }
    }
}

export async function deleteTaxRate(id: string) {
    try {
        await prisma.taxRate.delete({ where: { id } })
        revalidatePath("/admin/accounts/taxes")
        return { success: true }
    } catch {
        return { error: "Failed to delete tax rate" }
    }
}

export async function getTaxRates() {
    try {
        return await prisma.taxRate.findMany({
            orderBy: { rate: 'asc' }
        })
    } catch {
        return []
    }
}

// --- Utility: Calculate GST Split ---
export async function calculateTaxSplit(rate: number, placeOfSupply: string, companyState: string) {
    // If states match => Intra-State => CGST + SGST (Split evenly) (e.g. 18% => 9% CGST + 9% SGST)
    // If states differ => Inter-State => IGST (Full Rate) (e.g. 18% => 18% IGST)

    // Simple state checking logic (case insensitive)
    const isInterState = placeOfSupply?.toLowerCase() !== companyState?.toLowerCase()

    if (isInterState) {
        return { cgst: 0, sgst: 0, igst: rate }
    } else {
        const split = rate / 2
        return { cgst: split, sgst: split, igst: 0 }
    }
}
