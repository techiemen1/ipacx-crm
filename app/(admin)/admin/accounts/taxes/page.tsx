import { prisma } from "@/lib/prisma"
import { TaxRatesManagement } from "@/components/admin/tax-rates"

export default async function Page() {
    const rates = await prisma.taxRate.findMany({ orderBy: { rate: 'asc' } })
    return <TaxRatesManagement initialRates={rates} />
}
