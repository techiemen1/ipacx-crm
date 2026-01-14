"use server"

import { signIn, signOut, auth } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { userSchema, customerSchema, invoiceSchema } from "./schemas"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"
import { sendEmail } from "./mail"

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
    const { invoiceNo, customerId, dueDate, status, invoiceItems, type, notes, terms } = validated.data

    // Calculate totals from items
    const subtotal = invoiceItems?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0
    const taxTotal = invoiceItems?.reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0) + (item.cessAmount || 0), 0) || 0
    const totalAmount = subtotal + taxTotal - (validated.data.tdsAmount || 0)

    try {
        await prisma.invoice.create({
            data: {
                invoiceNo,
                customerId,
                amount: subtotal, // Save subtotal as amount
                taxRate: 0, // Legacy field, effectively unused for item-level tax
                taxAmount: taxTotal,
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
    console.log(`[ACTION] updateInvoice called for ID: ${id}`)
    const validated = invoiceSchema.safeParse(data)
    if (!validated.success) {
        console.error("Validation Error in updateInvoice:", validated.error.flatten())
        return { error: `Invalid data: ${Object.values(validated.error.flatten().fieldErrors).flat().join(", ")}` }
    }
    const { invoiceNo, customerId, dueDate, status, invoiceItems, type, notes, terms } = validated.data

    // Calculate totals from items
    const subtotal = invoiceItems?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0
    const taxTotal = invoiceItems?.reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0) + (item.cessAmount || 0), 0) || 0
    const totalAmount = subtotal + taxTotal - (validated.data.tdsAmount || 0)

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id }
            })

            // 2. Determine Status - Check payments
            // Only query payments if we aren't forcing a specific status manually (like Paid)
            // But usually, status is derived. Let's make it robust.
            const existingPayments = await tx.payment.findMany({
                where: { invoiceId: id }
            })
            const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0)

            let finalStatus = status
            let finalPaymentStatus = "Unpaid"

            if (totalPaid >= totalAmount && totalAmount > 0) {
                finalStatus = "Paid"
                finalPaymentStatus = "Paid"
            } else if (totalPaid > 0) {
                finalStatus = "Partial" // Or keep existing if it was 'Overdue' etc? Let's obey strict logic for now.
                finalPaymentStatus = "Partial"
            } else {
                // No payments. If user set "Draft", keep it. If "Pending" or other, keep it.
                // But ensure paymentStatus is Unpaid.
                finalPaymentStatus = "Unpaid"
                if (finalStatus === "Paid") finalStatus = "Pending" // Prevent Paid status without payments
            }

            // 3. Update invoice with new items and recalculated totals
            await tx.invoice.update({
                where: { id },
                data: {
                    invoiceNo,
                    customerId,
                    amount: subtotal,
                    taxRate: 0,
                    taxAmount: taxTotal,
                    totalAmount,
                    dueDate: new Date(dueDate),
                    status: finalStatus,
                    paymentStatus: finalPaymentStatus,
                    type,
                    invoiceItems: {
                        create: invoiceItems || []
                    },
                    notes,
                    terms,
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
        revalidatePath(`/admin/accounts/invoices/${id}`)
        revalidatePath(`/admin/accounts/invoices/${id}/edit`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update invoice" }
    }
}

export async function deleteInvoice(id: string) {
    console.log(`[ACTION] deleteInvoice called for ID: ${id}`)
    try {
        await prisma.$transaction([
            prisma.payment.deleteMany({ where: { invoiceId: id } }),
            prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
            prisma.invoice.delete({ where: { id } })
        ])
        revalidatePath("/admin/accounts")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete invoice (Likely linked data)" }
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

// --- Danger Zone ---

export async function resetApplicationData() {
    // Check if user is admin
    const session = await auth()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        await prisma.$transaction(async (tx) => {
            // SQLite "Nuclear" Reset - Bypass FKs on THIS transaction connection
            await tx.$executeRawUnsafe("PRAGMA foreign_keys = OFF;")
            console.log("Reset: Cleaning Data...")

            // Core Business Data
            await tx.billAllocation.deleteMany()
            await tx.voucherEntry.deleteMany()
            await tx.voucher.deleteMany()
            await tx.stockMovement.deleteMany()
            await tx.stockJournal.deleteMany()
            await tx.inventoryStock.deleteMany()
            await tx.inventoryBatch.deleteMany()
            await tx.productionOrder.deleteMany()
            await tx.bOMComponent.deleteMany()
            await tx.billOfMaterial.deleteMany()
            await tx.inventoryItem.deleteMany() // Moved here

            // Banking
            await tx.bankStatementLine.deleteMany()
            await tx.chequeLeaf.deleteMany()
            await tx.chequeBook.deleteMany()
            await tx.bankAccount.deleteMany()

            // Sales/Purchases
            await tx.payment.deleteMany()
            await tx.invoiceItem.deleteMany()
            await tx.invoice.deleteMany()
            await tx.expense.deleteMany()

            // CRM
            await tx.activity.deleteMany()
            await tx.cRMContact.deleteMany()
            await tx.cRMDeal.deleteMany()
            await tx.cRMStage.deleteMany()
            await tx.cRMPipeline.deleteMany()

            // HR & Tasks
            await tx.task.deleteMany()
            await tx.hRLeaveRequest.deleteMany()
            await tx.hRLeaveBalance.deleteMany()
            await tx.attendance.deleteMany()
            await tx.payslip.deleteMany()
            await tx.employeePayHead.deleteMany()
            await tx.employee.deleteMany() // Using Prisma method is safer if possible, but raw might be needed for cyclic dependencies if Foreign Keys were ON. With FK OFF, this is fine.

            // HR Config
            await tx.hRDepartment.deleteMany()
            await tx.hRDesignation.deleteMany()
            await tx.hRPayHead.deleteMany()
            await tx.hRShift.deleteMany()
            await tx.hRLeaveType.deleteMany()

            // Logs
            await tx.communicationLog.deleteMany()
            await tx.internalLog.deleteMany()

            // Master Data
            await tx.costCenter.deleteMany()
            await tx.property.deleteMany()
            // inventoryItem deleted above
            await tx.inventoryGroup.deleteMany()
            await tx.uomConversion.deleteMany()
            await tx.unitOfMeasure.deleteMany()
            await tx.warehouse.deleteMany()
            await tx.vendor.deleteMany()
            await tx.customer.deleteMany()
            await tx.project.deleteMany()
            await tx.companyProfile.deleteMany()
            await tx.accountHead.deleteMany()
            await tx.accountGroup.deleteMany()
            await tx.taxRate.deleteMany()
            await tx.appConfig.deleteMany()

            // Users & Access Control
            // We want to keep the CURRENT Admin user, or at least one admin.
            // But usually "Reset App Data" keeps users? 
            // The prompt said "not deleted" implying they wanted it deleted? 
            // "reset application data not deleted . how to wipe full ?"
            // Usually Application Data implies business transactions. Wiping users might lock them out.
            // I will wipe ALL users except the one currently logged in (or all admins).

            // Let's wipe non-admin users and profiles
            await tx.userRole.deleteMany()
            await tx.role.deleteMany()
            await tx.userProfile.deleteMany()

            // Delete all users except ADMINs to prevent lockout
            await tx.user.deleteMany({
                where: { role: { not: 'ADMIN' } }
            })

            console.log("Reset: Data cleaned.")

            // Re-enable FKs
            await tx.$executeRawUnsafe("PRAGMA foreign_keys = ON;")
        }, {
            timeout: 30000,
            maxWait: 5000
        })

        revalidatePath("/", "layout")
        return { success: true }
    } catch (e: any) {
        console.error("Hard Reset Failed:", e)
        return { error: `Failed to reset data: ${e.message}` }
    }
}

// --- Communication ---

export async function sendEmployeeBroadcast(formData: FormData) {
    const session = await auth()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized" }

    const subject = formData.get("subject") as string
    const message = formData.get("message") as string
    const targetType = formData.get("targetType") as string // "ALL", "DEPARTMENT", "EMPLOYEE"
    const targetId = formData.get("targetId") as string // For department
    const targetIdEmp = formData.get("targetId_emp") as string // For employee

    // Determine actual target ID based on type
    const finalTargetId = targetType === "DEPARTMENT" ? targetId : (targetType === "EMPLOYEE" ? targetIdEmp : null)

    if (!subject || !message) return { error: "Subject and message are required" }

    try {
        let employees: { email: string | null; firstName: string }[] = []

        if (targetType === "ALL") {
            employees = await prisma.employee.findMany({
                where: { status: "Active", email: { not: null } },
                select: { email: true, firstName: true }
            })
        } else if (targetType === "DEPARTMENT" && finalTargetId) {
            employees = await prisma.employee.findMany({
                where: { status: "Active", email: { not: null }, departmentId: finalTargetId },
                select: { email: true, firstName: true }
            })
        } else if (targetType === "EMPLOYEE" && finalTargetId) {
            const emp = await prisma.employee.findUnique({
                where: { id: finalTargetId },
                select: { email: true, firstName: true }
            })
            if (emp) employees = [emp]
        }

        if (employees.length === 0) return { error: "No valid recipients found" }

        // Send Emails in parallel
        let sentCount = 0
        await Promise.all(employees.map(async (emp) => {
            if (emp.email) {
                await sendEmail({
                    to: emp.email,
                    subject: subject,
                    html: `<p>Dear ${emp.firstName},</p>${message}<p><br>Best regards,<br>Admin Team</p>`
                })
                sentCount++
            }
        }))

        // Log the activity
        await prisma.communicationLog.create({
            data: {
                subject,
                body: message,
                recipientType: targetType,
                recipientId: finalTargetId || "ALL",
                status: "Sent",
                sentBy: session?.user?.name || "Admin",
            }
        })

        revalidatePath("/admin/communications")
        return { success: true, count: sentCount }
    } catch (error: any) {
        console.error("Broadcast Failed:", error)
        return { error: error.message }
    }
}
