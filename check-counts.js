
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const models = [
        'inventoryItem', 'inventoryStock', 'invoice', 'expense', 'payment',
        'employee', 'payslip', 'voucher', 'voucherEntry', 'bankAccount',
        'user', 'userProfile', 'warehouse', 'unitOfMeasure', 'inventoryGroup'
    ]

    console.log('--- Table Counts ---')
    for (const model of models) {
        try {
            // @ts-ignore
            const count = await prisma[model].count()
            console.log(`${model}: ${count}`)
        } catch (e) {
            console.log(`${model}: Error or not found`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
