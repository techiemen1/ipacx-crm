"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Fetch Actions ---

export async function getAccountHeads() {
    try {
        const heads = await prisma.accountHead.findMany({
            include: { group: true },
            orderBy: { name: 'asc' }
        })
        return { data: heads }
    } catch (e) {
        return { error: "Failed to fetch account heads" }
    }
}



export async function getAccountGroups() {
    try {
        const groups = await prisma.accountGroup.findMany({ orderBy: { name: 'asc' } })
        return { data: groups }
    } catch (e) {
        return { error: "Failed to fetch account groups" }
    }
}

export async function createAccountGroup(data: { name: string; type: string; parentId?: string }) {
    try {
        await prisma.accountGroup.create({ data })
        revalidatePath("/admin/accounts/ledger")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create account group" }
    }
}

export async function createAccountHead(data: { name: string; code?: string; groupId: string; type: string }) {
    try {
        await prisma.accountHead.create({ data })
        revalidatePath("/admin/accounts/ledger")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create account ledger" }
    }
}

export async function getVouchers() {
    try {
        const vouchers = await prisma.voucher.findMany({
            include: {
                entries: {
                    include: { account: true }
                }
            },
            orderBy: { date: 'desc' }
        })
        return { data: vouchers }
    } catch (e) {
        return { error: "Failed to fetch vouchers" }
    }
}
// --- Cost Center Actions ---

export async function getCostCenters() {
    try {
        const centers = await prisma.costCenter.findMany({ orderBy: { name: 'asc' } })
        return { data: centers }
    } catch (e) {
        return { error: "Failed to fetch cost centers" }
    }
}

export async function createCostCenter(data: { name: string; code?: string; budget?: number }) {
    try {
        await prisma.costCenter.create({ data })
        revalidatePath("/admin/accounts/cost-centers")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create cost center" }
    }
}

// --- Create Actions ---

interface VoucherEntryInput {
    accountId: string
    debit: number
    credit: number
    currency?: string
    exchangeRate?: number
    costCenterId?: string | null
}

interface CreateVoucherInput {
    date: Date
    type: string // "PAYMENT" | "RECEIPT" | "JOURNAL" | "CONTRA"
    narration?: string
    reference?: string
    entries: VoucherEntryInput[]
}

export async function createVoucher(data: CreateVoucherInput) {
    // Validate Double Entry Rule: Total Debit == Total Credit
    const totalDebit = data.entries.reduce((sum, entry) => sum + entry.debit, 0)
    const totalCredit = data.entries.reduce((sum, entry) => sum + entry.credit, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) { // Float tolerance
        return { error: `Unbalanced transaction. Debit: ${totalDebit}, Credit: ${totalCredit}` }
    }

    try {
        // Generate Voucher No (Simple format for now: TYPE-DATE-RANDOM)
        const dateStr = data.date.toISOString().split('T')[0].replace(/-/g, '')
        const shortType = data.type.substring(0, 3).toUpperCase()
        const count = await prisma.voucher.count({ where: { type: data.type } })
        const voucherNo = `${shortType}-${dateStr}-${(count + 1).toString().padStart(4, '0')}`

        const voucher = await prisma.voucher.create({
            data: {
                voucherNo,
                date: data.date,
                type: data.type,
                narration: data.narration,
                reference: data.reference,
                status: "POSTED",
                entries: {
                    create: data.entries.map(entry => ({
                        accountId: entry.accountId,
                        debit: entry.debit,
                        credit: entry.credit,
                        currency: entry.currency || "INR",
                        exchangeRate: entry.exchangeRate || 1.0,
                        costCenterId: entry.costCenterId,
                        foreignAmount: entry.currency !== "INR" ? (entry.debit || entry.credit) : 0 // Rough logic
                    }))
                }
            }
        })

        // TODO: Update AccountHead currentBalance (Dr - Cr) for performance caching if needed

        revalidatePath("/admin/accounts/vouchers")
        return { success: true, data: voucher }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create voucher" }
    }
}

export async function processPayrollAction(staffIds: string[]) {
    try {
        const staff = await prisma.user.findMany({
            where: { id: { in: staffIds } },
            include: { profile: true }
        })

        // Find or create "Salaries" Account Head (Expense)
        let salaryAccount = await prisma.accountHead.findFirst({ where: { name: "Salaries" } })
        if (!salaryAccount) {
            // Find Expense Group
            const expenseGroup = await prisma.accountGroup.findFirst({ where: { type: "EXPENSE" } })
            if (!expenseGroup) return { error: "Expense Account Group missing" }
            salaryAccount = await prisma.accountHead.create({
                data: { name: "Salaries", groupId: expenseGroup.id, type: "Dr" }
            })
        }

        // Find or create "Bank" Account Head (Asset)
        let bankAccount = await prisma.accountHead.findFirst({ where: { name: "Bank" } })
        if (!bankAccount) {
            // Find Asset Group
            const assetGroup = await prisma.accountGroup.findFirst({ where: { type: "ASSET" } })
            if (!assetGroup) return { error: "Asset Account Group missing" }
            bankAccount = await prisma.accountHead.create({
                data: { name: "Bank", groupId: assetGroup.id, type: "Dr" }
            })
        }

        // Create Voucher
        const totalAmount = staff.reduce((sum, s) => sum + (s.profile?.salary || 0), 0)

        const entries = [
            {
                accountId: salaryAccount.id,
                debit: totalAmount,
                credit: 0,
            },
            {
                accountId: bankAccount.id,
                debit: 0,
                credit: totalAmount
            }
        ]

        await createVoucher({
            date: new Date(),
            type: "PAYMENT",
            narration: `Payroll processed for ${staff.length} employees`,
            entries
        })

        revalidatePath("/admin/accounts/payroll")
        return { success: true, count: staff.length, total: totalAmount }

    } catch (e) {
        console.error(e)
        return { error: "Failed to process payroll" }
    }
}
