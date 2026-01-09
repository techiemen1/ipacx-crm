import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceForm } from "@/components/forms/invoice-form"
import { redirect } from "next/navigation"

export default async function NewInvoicePage() {
    const session = await auth()
    if (!session) redirect("/login")

    // Fetch customers for the dropdown
    const customers = await prisma.customer.findMany({
        select: { id: true, name: true, address: true, gstin: true },
        orderBy: { name: 'asc' }
    })

    const inventoryItems = await prisma.inventoryItem.findMany({
        select: { name: true }
    })

    const taxRates = await prisma.taxRate.findMany({
        where: { type: "GST" },
        select: { id: true, name: true, rate: true }
    })

    const companyProfiles = (await prisma.companyProfile.findMany({
        select: { id: true, name: true, address: true, gstin: true }
    })).map(c => ({
        ...c,
        address: c.address || ""
    }))

    return (
        <div className="space-y-6 max-w-3xl mx-auto py-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
                <p className="text-muted-foreground">Generate a new invoice for a customer.</p>
            </div>

            <InvoiceForm
                customers={customers}
                inventoryItems={inventoryItems}
                taxRates={taxRates}
                companyProfiles={companyProfiles}
            />
        </div>
    )
}
