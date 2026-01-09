import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const invoices = await prisma.invoice.findMany()
    console.log(invoices)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
