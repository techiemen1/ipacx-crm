"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { customerSchema } from "./schemas"
import { z } from "zod"

// --- Bulk Internal Functions ---

export async function bulkImportLeads(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    try {
        let rows: any[] = []

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer)
            const sheetName = workbook.SheetNames[0]
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
        } else {
            const text = await file.text()
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
            rows = parsed.data as any[]
        }

        if (rows.length === 0) return { error: "No data found in CSV" }

        // Process rows and map to schema
        const leads = []
        let successCount = 0
        let errorCount = 0

        for (const row of rows) {
            // Normalize row keys to handle case sensitivity and whitespace
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
                if (cleanKey) normalizedRow[cleanKey] = row[key];
            });

            // Map commonly used CSV headers to our schema keys using normalized lookup
            // Priorities: name > fullname > firstname > customername
            const leadData: any = {
                name: normalizedRow["name"] || normalizedRow["fullname"] || normalizedRow["firstname"] || normalizedRow["customername"] || normalizedRow["clientname"],
                email: normalizedRow["email"] || normalizedRow["mailid"] || normalizedRow["e_mail"] || `no-email-${Date.now()}-${Math.random()}@placeholder.com`,
                phone: normalizedRow["phone"] || normalizedRow["phoneno"] || normalizedRow["mobile"] || normalizedRow["mobileno"] || normalizedRow["cell"] || normalizedRow["contact"] || normalizedRow["contactno"],
                projectInterest: normalizedRow["projectinterest"] || normalizedRow["property"] || normalizedRow["project"] || normalizedRow["interestedin"],
                status: normalizedRow["status"] || "Lead",
                address: normalizedRow["address"] || normalizedRow["location"] || normalizedRow["city"] || normalizedRow["residence"]
            };

            // Clean phone number: keep only digits and +
            if (leadData.phone) {
                leadData.phone = String(leadData.phone).replace(/[^0-9+]/g, "");
            }

            // Validate
            const parseResult = customerSchema.safeParse(leadData);

            if (parseResult.success) {
                try {
                    await prisma.customer.upsert({
                        where: { email: parseResult.data.email },
                        update: { ...parseResult.data }, // Update if exists
                        create: { ...parseResult.data, status: parseResult.data.status || "Lead" }
                    });
                    successCount++;
                } catch (e) {
                    console.error("Row import error", e);
                    errorCount++;
                }
            } else {
                console.log("Validation error for row:", { name: leadData.name, phone: leadData.phone }, parseResult.error);
                errorCount++;
            }
        }

        revalidatePath("/admin/crm")
        return { success: true, count: successCount, errors: errorCount }

    } catch (e) {
        console.error(e)
        return { error: "Failed to parse CSV" }
    }
}

// --- Backup & Restore ---

export async function exportSystemData() {
    try {
        // Fetch all data
        const [users, customers, companies, projects, properties, invoiceItems, invoices, expenses, payments, vendors] = await prisma.$transaction([
            prisma.user.findMany(),
            prisma.customer.findMany(),
            prisma.companyProfile.findMany(),
            prisma.project.findMany(),
            prisma.property.findMany(),
            prisma.invoiceItem.findMany(),
            prisma.invoice.findMany(),
            prisma.expense.findMany(),
            prisma.payment.findMany(),
            prisma.vendor.findMany()
        ])

        const backupData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            data: {
                users,
                customers,
                companies,
                projects,
                properties,
                invoiceItems, // Deprecated in favor of relation but kept if needed
                invoices,
                expenses,
                payments,
                vendors
            }
        }

        return { data: JSON.stringify(backupData, null, 2) }

    } catch (e) {
        console.error(e)
        return { error: "Failed to export data" }
    }
}


export async function importSystemData(jsonString: string) {
    if (!jsonString) return { error: "No data provided" }

    try {
        const parsed = JSON.parse(jsonString)
        const data = parsed.data || parsed // Support direct object or wrapped

        // Order is critical for Foreign Keys:
        // 1. Users (needed for expenses, tasks)
        // 2. Customers (needed for invoices)
        // 3. Projects (needed for properties, expenses)
        // 4. Vendors
        // 5. CompanyProfiles
        // --
        // 6. Properties (needs project)
        // 7. Expenses (needs user, project, vendor)
        // 8. Invoices (needs customer, companyProfile)
        // 9. InvoiceItems (needs invoice)
        // 10. Payments (needs invoice)

        await prisma.$transaction(async (tx) => {
            // Upsert Users
            if (data.users?.length) {
                for (const item of data.users) {
                    await tx.user.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Upsert Company Profiles
            if (data.companies?.length) {
                for (const item of data.companies) {
                    await tx.companyProfile.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Upsert Projects
            if (data.projects?.length) {
                for (const item of data.projects) {
                    await tx.project.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Upsert Customers
            if (data.customers?.length) {
                for (const item of data.customers) {
                    await tx.customer.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Vendors
            if (data.vendors?.length) {
                for (const item of data.vendors) {
                    await tx.vendor.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Expenses
            if (data.expenses?.length) {
                for (const item of data.expenses) {
                    // Check relations exist? Or assume consistent backup?
                    // Upsert expense
                    await tx.expense.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Invoices (Complex due to items relation)
            if (data.invoices?.length) {
                for (const item of data.invoices) {
                    const { invoiceItems: items, payments, ...invoiceData } = item
                    // Omit nested relations from create data if they were included in export fetch
                    // But in exportSystemData, we did distinct fetches. So `item` doesn't have nested.
                    // Oh wait, `prisma.invoice.findMany()` doesn't include relations by default. 
                    // So `item` is flat invoice data. Correct.

                    await tx.invoice.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Invoice Items
            if (data.invoiceItems?.length) {
                for (const item of data.invoiceItems) {
                    await tx.invoiceItem.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Payments
            if (data.payments?.length) {
                for (const item of data.payments) {
                    await tx.payment.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined }, // payment has no updatedAt in schema? Let's check
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }

            // Properties
            if (data.properties?.length) {
                for (const item of data.properties) {
                    await tx.property.upsert({
                        where: { id: item.id },
                        update: { ...item, createdAt: undefined, updatedAt: undefined },
                        create: { ...item, createdAt: undefined, updatedAt: undefined }
                    })
                }
            }
        })

        revalidatePath("/admin")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to restore data. Check consistency." }
    }
}
