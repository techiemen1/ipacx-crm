"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const bankAccountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    ifsc: z.string().optional(),
    bankName: z.string().optional(),
    branch: z.string().optional(),
    currency: z.string().default("INR"),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>

export async function createBankAccount(data: BankAccountFormValues) {
    const validated = bankAccountSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        // 1. Create a Ledger Account Head for this Bank automatically
        // Find "Bank Accounts" group or similar
        const bankGroup = await prisma.accountGroup.findFirst({
            where: { name: { contains: "Bank Accounts" } }
        })

        // Ideally we should have a seed for "Current Assets" -> "Bank Accounts"
        // Fallback: Create under Current Assets if Bank Accounts group missing, or just create root
        // For now assuming "Current Assets" exists or we create it.

        // We will simple create the BankAccount entry first. Linking to Ledger can be a second step or automated later 
        // to strictly follow the "AccountHead" model.
        // Let's create an AccountHead for this bank.

        let groupId = bankGroup?.id
        if (!groupId) {
            // Find Current Assets
            const currentAssets = await prisma.accountGroup.findFirst({ where: { name: "Current Assets" } })
            if (currentAssets) {
                const newGroup = await prisma.accountGroup.create({
                    data: {
                        name: "Bank Accounts",
                        type: "ASSET",
                        parentGroupId: currentAssets.id
                    }
                })
                groupId = newGroup.id
            }
        }

        // Create Account Head
        let accountHeadId = undefined
        if (groupId) {
            const head = await prisma.accountHead.create({
                data: {
                    name: validated.data.name,
                    groupId: groupId,
                    type: "Dr",
                    currentBalance: 0
                }
            })
            accountHeadId = head.id
        }

        await prisma.bankAccount.create({
            data: {
                ...validated.data,
                accountHeadId: accountHeadId
            }
        })

        revalidatePath("/admin/accounts/banking")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create bank account" }
    }
}


export async function getBankAccounts() {
    try {
        return await prisma.bankAccount.findMany({
            include: { accountHead: true },
            orderBy: { createdAt: 'desc' }
        })
    } catch {
        return []
    }
}

// --- Cheque Management ---

const chequeBookSchema = z.object({
    bankAccountId: z.string(),
    startLeaf: z.string().length(6, "Must be 6 digits"), // India standard
    endLeaf: z.string().length(6, "Must be 6 digits"),
})

export async function createChequeBook(data: z.infer<typeof chequeBookSchema>) {
    const validated = chequeBookSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        // Generate Leaves
        const start = parseInt(validated.data.startLeaf)
        const end = parseInt(validated.data.endLeaf)

        if (end < start) return { error: "End leaf must be greater than start leaf" }
        if ((end - start) > 100) return { error: "Cannot create more than 100 leaves at once" }

        const leafData = []
        for (let i = start; i <= end; i++) {
            leafData.push({
                leafNumber: i.toString().padStart(6, '0'),
                status: "Available"
            })
        }

        await prisma.chequeBook.create({
            data: {
                bankAccountId: validated.data.bankAccountId,
                startLeaf: validated.data.startLeaf,
                endLeaf: validated.data.endLeaf,
                leaves: {
                    create: leafData
                }
            }
        })
        revalidatePath("/admin/accounts/banking")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create cheque book" }
    }
}

export async function getChequeBooks(bankAccountId: string) {
    if (!bankAccountId) return []
    try {
        return await prisma.chequeBook.findMany({
            where: { bankAccountId },
            include: {
                leaves: {
                    orderBy: { leafNumber: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch {
        return []
    }
}

// --- Reconciliation ---

export async function getReconciliationData(bankAccountId: string) {
    try {
        const account = await prisma.bankAccount.findUnique({
            where: { id: bankAccountId },
            include: { accountHead: true }
        })
        if (!account) return { error: "Account not found" }

        const statementLines = await prisma.bankStatementLine.findMany({
            where: {
                bankAccountId,
                isReconciled: false
            },
            orderBy: { date: 'asc' }
        })

        // Find system vouchers affecting this bank account
        // We look for VoucherEntries where the linked AccountHead is this bank's account head
        const accountHeadId = account.accountHeadId
        const systemVouchers = accountHeadId ? await prisma.voucherEntry.findMany({
            where: {
                accountId: accountHeadId,
                // We typically want unreconciled ones. But VoucherEntry doesn't have isReconciled flag. 
                // We use BankStatementLine.matchedVoucherId to track. 
                // So we need to filter out vouchers that are ALREADY matched.
                // WE need to check if any statement line has matchedVoucherId pointing to this voucher.
                voucher: {
                    status: "POSTED",
                    statementLines: {
                        none: {}
                    }
                }
            },
            include: {
                voucher: true
            },
            orderBy: { voucher: { date: 'asc' } }
        }) : []

        return { account, statementLines, systemVouchers }
    } catch (e) {
        console.error(e)
        return { error: "Failed to fetch data" }
    }
}

export async function uploadStatement(bankAccountId: string, lines: any[]) {
    // lines: { date, amount, description, refNo, type }
    try {
        const data = lines.map(line => ({
            bankAccountId,
            date: new Date(line.date),
            amount: parseFloat(line.amount),
            type: line.type,
            description: line.description,
            refNo: line.refNo,
            balance: 0 // Mock balance implies running balance which requires calculation. For now 0.
        }))

        for (const item of data) {
            await prisma.bankStatementLine.create({ data: item })
        }
        revalidatePath(`/admin/accounts/banking/reconcile/${bankAccountId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to upload statement" }
    }
}

export async function reconcileTransaction(statementLineId: string, voucherId: string) {
    try {
        await prisma.bankStatementLine.update({
            where: { id: statementLineId },
            data: {
                isReconciled: true,
                matchedVoucherId: voucherId
            }
        })
        revalidatePath("/admin/accounts/banking")
        return { success: true }
    } catch {
        return { error: "Failed to reconcile" }
    }
}

