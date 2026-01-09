"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { userSchema, customerSchema, invoiceSchema } from "./schemas"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

// --- Auth Actions ---

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }

    // Manual redirect after successful non-redirecting sign-in
    revalidatePath("/", "layout")
    redirect("/dashboard")
}



// --- User Actions ---

// --- User Actions ---

export async function createUser(data: unknown) {
    const validated = userSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    const { name, email, password, role, designation, phone } = validated.data
    const hashedPassword = await hash(password || "defaultPassword123", 10)

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                profile: {
                    create: { designation, phone, status: "Active" }
                }
            }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch {
        return { error: "Failed to create user." }
    }
}

export async function updateUser(id: string, data: unknown) {
    const validated = userSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }
    const { name, email, role, designation, phone, password } = validated.data

    const updateData: any = {
        name,
        email,
        role,
        profile: {
            upsert: {
                create: { designation, phone },
                update: { designation, phone }
            }
        }
    }

    if (password && password.length >= 6) {
        updateData.password = await hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id },
            data: updateData
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch {
        return { error: "Failed to update user." }
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch {
        return { error: "Failed to delete user." }
    }
}

// --- Customer Actions ---

export async function createCustomer(data: unknown) {
    const validated = customerSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    // address, gstin, pan are included in validated.data
    // use validated.data directly to include all fields
    try {
        await prisma.customer.create({
            data: validated.data
        })
        revalidatePath("/admin/crm")
        revalidatePath("/admin/profiles/customers")
        return { success: true }
    } catch {
        return { error: "Failed to create customer" }
    }
}

export async function updateCustomer(id: string, data: unknown) {
    const validated = customerSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.customer.update({
            where: { id },
            data: validated.data
        })
        revalidatePath("/admin/crm")
        revalidatePath("/admin/profiles/customers")
        return { success: true }
    } catch {
        return { error: "Failed to update customer" }
    }
}

// Bulk Actions
export async function deleteCustomers(ids: string[]) {
    try {
        // 1. Check for constraints (Invoices)
        const customersWithInvoices = await prisma.invoice.groupBy({
            by: ['customerId'],
            where: { customerId: { in: ids } }
        })

        if (customersWithInvoices.length > 0) {
            return { error: `Cannot delete ${customersWithInvoices.length} customers because they have linked invoices. Please delete invoices first.` }
        }

        // 2. Delete related Deals explicitly (since no Cascade in schema)
        await prisma.cRMDeal.deleteMany({
            where: { customerId: { in: ids } }
        })

        // 3. Delete Customers (Activity & Contacts cascade automatically)
        await prisma.customer.deleteMany({
            where: { id: { in: ids } }
        })

        revalidatePath("/admin/crm")
        revalidatePath("/admin/profiles/customers")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete customers. Check foreign key constraints." }
    }
}

export async function deleteCustomer(id: string) {
    try {
        // Validation check
        const invoiceCount = await prisma.invoice.count({ where: { customerId: id } })
        if (invoiceCount > 0) return { error: "Cannot delete customer with existing invoices." }

        // Manual Cascade
        await prisma.cRMDeal.deleteMany({ where: { customerId: id } })

        await prisma.customer.delete({ where: { id } })
        revalidatePath("/admin/crm")
        revalidatePath("/admin/profiles/customers")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete customer" }
    }
}

// --- Invoice Actions ---

// --- Invoice Actions ---

export async function createInvoice(data: unknown) {
    const validated = invoiceSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }
    const { invoiceNo, customerId, amount, taxRate, dueDate, status, invoiceItems, type, notes, terms } = validated.data

    const taxAmount = (amount * (taxRate || 0)) / 100
    const totalAmount = amount + taxAmount

    try {
        await prisma.invoice.create({
            data: {
                invoiceNo,
                customerId,
                amount,
                taxRate: taxRate || 0,
                taxAmount,
                totalAmount,
                dueDate: new Date(dueDate),
                status,
                paymentStatus: status === 'Paid' ? 'Paid' : 'Unpaid',
                type,
                // items: items || "[]", // Deprecated
                invoiceItems: {
                    create: invoiceItems || []
                },
                notes,
                terms,
                // New Statutory Fields
                // New Statutory Fields
                placeOfSupply: validated.data.placeOfSupply,
                gstin: validated.data.gstin,
                tdsAmount: validated.data.tdsAmount,
                tcsAmount: validated.data.tcsAmount,
                transportMode: validated.data.transportMode,
                vehicleNo: validated.data.vehicleNo,
                distance: validated.data.distance,
                transporterId: validated.data.transporterId || null,
                companyProfileId: validated.data.companyProfileId || null
            }
        })
        revalidatePath("/admin/accounts")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create invoice" }
    }
}

// ... existing deleteInvoice ...

// --- Vendor Actions ---

import { vendorSchema, expenseSchema, paymentSchema, companyProfileSchema } from "./schemas"

export async function createVendor(data: unknown) {
    const validated = vendorSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.vendor.create({
            data: validated.data
        })
        revalidatePath("/admin/vendors")
        return { success: true }
    } catch {
        return { error: "Failed to create vendor" }
    }
}

export async function updateVendor(id: string, data: unknown) {
    const validated = vendorSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.vendor.update({
            where: { id },
            data: validated.data
        })
        revalidatePath("/admin/vendors")
        return { success: true }
    } catch {
        return { error: "Failed to update vendor" }
    }
}

export async function deleteVendor(id: string) {
    try {
        await prisma.vendor.delete({ where: { id } })
        revalidatePath("/admin/vendors")
        return { success: true }
    } catch {
        return { error: "Failed to delete vendor" }
    }
}

// --- Expense Actions ---

export async function createExpense(data: unknown, userId: string) {
    const validated = expenseSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.expense.create({
            data: {
                ...validated.data,
                date: new Date(validated.data.date),
                recordedBy: userId
            }
        })
        revalidatePath("/admin/accounts/expenses")
        return { success: true }
    } catch {
        return { error: "Failed to create expense" }
    }
}

export async function deleteExpense(id: string) {
    try {
        await prisma.expense.delete({ where: { id } })
        revalidatePath("/admin/accounts/expenses")
        return { success: true }
    } catch {
        return { error: "Failed to delete expense" }
    }
}

// --- Payment Actions ---

export async function recordPayment(data: unknown) {
    const validated = paymentSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    const { invoiceId, amount } = validated.data

    try {
        // Create payment record
        await prisma.payment.create({
            data: {
                ...validated.data,
                date: new Date(validated.data.date)
            }
        })

        // Update invoice status logic
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true }
        })

        if (invoice) {
            const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount
            let paymentStatus = "Partial"
            if (totalPaid >= invoice.totalAmount) paymentStatus = "Paid"
            if (totalPaid === 0) paymentStatus = "Unpaid"

            await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    paymentStatus,
                    status: paymentStatus === 'Paid' ? 'Paid' : invoice.status
                }
            })
        }

        revalidatePath("/admin/accounts")
        return { success: true }
    } catch {
        return { error: "Failed to record payment" }
    }
}

export async function updateInvoice(id: string, data: unknown) {
    const validated = invoiceSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }
    const { invoiceNo, customerId, amount, taxRate, dueDate, status, invoiceItems, type, notes, terms } = validated.data

    const taxAmount = (amount * (taxRate || 0)) / 100
    const totalAmount = amount + taxAmount

    try {
        // Transaction to update invoice and replace items
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id }
            })

            // 2. Update invoice with new items
            await tx.invoice.update({
                where: { id },
                data: {
                    invoiceNo,
                    customerId,
                    amount,
                    taxRate: taxRate || 0,
                    taxAmount,
                    totalAmount,
                    dueDate: new Date(dueDate),
                    status,
                    paymentStatus: status === 'Paid' ? 'Paid' : 'Unpaid',
                    type,
                    invoiceItems: {
                        create: invoiceItems || []
                    },
                    notes,
                    terms,
                    // New Statutory Fields
                    // New Statutory Fields
                    placeOfSupply: validated.data.placeOfSupply,
                    gstin: validated.data.gstin,
                    tdsAmount: validated.data.tdsAmount,
                    tcsAmount: validated.data.tcsAmount,
                    transportMode: validated.data.transportMode,
                    vehicleNo: validated.data.vehicleNo,
                    distance: validated.data.distance,
                    transporterId: validated.data.transporterId || null,
                    companyProfileId: validated.data.companyProfileId || null
                }
            })
        })

        revalidatePath("/admin/accounts")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update invoice" }
    }
}

export async function deleteInvoice(id: string) {
    try {
        await prisma.invoice.delete({ where: { id } })
        revalidatePath("/admin/accounts")
        return { success: true }
    } catch {
        return { error: "Failed to delete invoice" }
    }
}
// ... existing imports
import { propertySchema, inventoryItemSchema, projectSchema } from "./schemas"

// --- existing actions ...

// --- Property Actions ---

export async function createProperty(data: unknown) {
    const validated = propertySchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.property.create({
            data: { ...validated.data }
        })
        revalidatePath("/admin/properties")
        return { success: true }
    } catch {
        return { error: "Failed to create property" }
    }
}

export async function deleteProperty(id: string) {
    try {
        await prisma.property.delete({ where: { id } })
        revalidatePath("/admin/properties")
        return { success: true }
    } catch {
        return { error: "Failed to delete property" }
    }
}

// --- Inventory Actions ---

export async function createInventoryItem(data: unknown) {
    const validated = inventoryItemSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.inventoryItem.create({
            data: { ...validated.data }
        })
        revalidatePath("/admin/inventory")
        return { success: true }
    } catch {
        return { error: "Failed to create inventory item" }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await prisma.inventoryItem.delete({ where: { id } })
        revalidatePath("/admin/inventory")
        return { success: true }
    } catch {
        return { error: "Failed to delete inventory item" }
    }
}

// --- Project Actions ---

export async function createProject(data: unknown) {
    const validated = projectSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.project.create({
            data: { ...validated.data }
        })
        revalidatePath("/admin/projects")
        revalidatePath("/admin/properties")
        return { success: true }
    } catch {
        return { error: "Failed to create project" }
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } })
        revalidatePath("/admin/projects")
        revalidatePath("/admin/properties")
        return { success: true }
    } catch {
        return { error: "Failed to delete project" }
    }
}

// --- Company Projects Actions ---

export async function getCompanies() {
    try {
        const companies = await prisma.companyProfile.findMany({
            orderBy: { isDefault: 'desc' }
        })
        return { data: companies }
    } catch (e) {
        console.error(e)
        return { error: "Failed to fetch companies" }
    }
}

export async function createCompany(data: unknown) {
    const validated = companyProfileSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        const company = await prisma.companyProfile.create({
            data: validated.data
        })
        revalidatePath("/admin/settings")
        return { data: company }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create company" }
    }
}

export async function updateCompany(id: string, data: unknown) {
    const validated = companyProfileSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        const company = await prisma.companyProfile.update({
            where: { id },
            data: validated.data
        })
        revalidatePath("/admin/settings")
        return { data: company }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update company" }
    }
}

export async function deleteCompany(id: string) {
    try {
        await prisma.companyProfile.delete({
            where: { id }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete company" }
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" })
}
