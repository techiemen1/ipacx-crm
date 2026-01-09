
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Chart of Accounts...')

    // 1. Root Groups
    const assets = await prisma.accountGroup.upsert({
        where: { name: 'Assets' },
        update: {},
        create: { name: 'Assets', type: 'ASSET' }
    })

    const liabilities = await prisma.accountGroup.upsert({
        where: { name: 'Liabilities' },
        update: {},
        create: { name: 'Liabilities', type: 'LIABILITY' }
    })

    const income = await prisma.accountGroup.upsert({
        where: { name: 'Income' },
        update: {},
        create: { name: 'Income', type: 'INCOME' }
    })

    const expenses = await prisma.accountGroup.upsert({
        where: { name: 'Expenses' },
        update: {},
        create: { name: 'Expenses', type: 'EXPENSE' }
    })

    // 2. Sub Groups
    const currentAssets = await prisma.accountGroup.upsert({
        where: { name: 'Current Assets' },
        update: { parentGroupId: assets.id, type: 'ASSET' },
        create: { name: 'Current Assets', type: 'ASSET', parentGroupId: assets.id }
    })

    const indirectExpenses = await prisma.accountGroup.upsert({
        where: { name: 'Indirect Expenses' },
        update: { parentGroupId: expenses.id, type: 'EXPENSE' },
        create: { name: 'Indirect Expenses', type: 'EXPENSE', parentGroupId: expenses.id }
    })

    const directExpenses = await prisma.accountGroup.upsert({
        where: { name: 'Direct Expenses' },
        update: { parentGroupId: expenses.id, type: 'EXPENSE' },
        create: { name: 'Direct Expenses', type: 'EXPENSE', parentGroupId: expenses.id }
    })

    const salesAccounts = await prisma.accountGroup.upsert({
        where: { name: 'Sales Accounts' },
        update: { parentGroupId: income.id, type: 'INCOME' },
        create: { name: 'Sales Accounts', type: 'INCOME', parentGroupId: income.id }
    })

    const dutiesTaxes = await prisma.accountGroup.upsert({
        where: { name: 'Duties & Taxes' },
        update: { parentGroupId: liabilities.id, type: 'LIABILITY' },
        create: { name: 'Duties & Taxes', type: 'LIABILITY', parentGroupId: liabilities.id }
    })

    const sundryCreditors = await prisma.accountGroup.upsert({
        where: { name: 'Sundry Creditors' },
        update: { parentGroupId: liabilities.id, type: 'LIABILITY' },
        create: { name: 'Sundry Creditors', type: 'LIABILITY', parentGroupId: liabilities.id }
    })

    const sundryDebtors = await prisma.accountGroup.upsert({
        where: { name: 'Sundry Debtors' },
        update: { parentGroupId: currentAssets.id, type: 'ASSET' },
        create: { name: 'Sundry Debtors', type: 'ASSET', parentGroupId: currentAssets.id }
    })

    const bankAccounts = await prisma.accountGroup.upsert({
        where: { name: 'Bank Accounts' },
        update: { parentGroupId: currentAssets.id, type: 'ASSET' },
        create: { name: 'Bank Accounts', type: 'ASSET', parentGroupId: currentAssets.id }
    })

    const cashInHand = await prisma.accountGroup.upsert({
        where: { name: 'Cash-in-hand' },
        update: { parentGroupId: currentAssets.id, type: 'ASSET' },
        create: { name: 'Cash-in-hand', type: 'ASSET', parentGroupId: currentAssets.id }
    })

    // 3. Common Heads
    await prisma.accountHead.upsert({
        where: { code: 'CASH' },
        update: { groupId: cashInHand.id },
        create: { name: 'Cash', code: 'CASH', groupId: cashInHand.id, type: 'Dr' }
    })

    await prisma.accountHead.upsert({
        where: { code: 'SALES' },
        update: { groupId: salesAccounts.id },
        create: { name: 'Sales', code: 'SALES', groupId: salesAccounts.id, type: 'Cr' }
    })

    await prisma.accountHead.upsert({
        where: { code: 'PURCHASE' },
        update: { groupId: directExpenses.id },
        create: { name: 'Purchase', code: 'PURCHASE', groupId: directExpenses.id, type: 'Dr' }
    })

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
