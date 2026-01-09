import { PrismaClient } from '@prisma/client'
import { InvoiceList } from '@/components/admin/invoice-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const prisma = new PrismaClient()

export default async function InvoicesPage() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { issuedDate: 'desc' },
        include: { customer: true, payments: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <Link href="/admin/accounts/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <InvoiceList initialInvoices={invoices} />
            </div>
        </div>
    )
}
