import { prisma } from "@/lib/prisma"
import { InvoiceForm } from '@/components/forms/invoice-form'
import { notFound } from 'next/navigation'

interface EditInvoicePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { invoiceItems: true }
    })

    if (!invoice) {
        notFound()
    }

    const customers = await prisma.customer.findMany({
        select: { id: true, name: true, address: true, gstin: true },
        where: { status: { in: ['Customer', 'Prospect'] } }
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
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
            </div>

            <InvoiceForm
                customers={customers}
                initialData={invoice}
                inventoryItems={inventoryItems}
                taxRates={taxRates}
                companyProfiles={companyProfiles}
            />
        </div>
    )
}
