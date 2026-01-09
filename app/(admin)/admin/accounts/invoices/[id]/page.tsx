import { PrismaClient } from '@prisma/client'
import { InvoiceView } from '@/components/admin/invoice-view'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

interface ViewInvoicePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ViewInvoicePage({ params }: ViewInvoicePageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            invoiceItems: true,
            payments: true
        }
    })

    if (!invoice) {
        notFound()
    }

    // Fetch default company profile
    const companyProfile = await prisma.companyProfile.findFirst({
        orderBy: { isDefault: 'desc' }
    })

    return <InvoiceView invoice={invoice} companyProfile={companyProfile} />
}
