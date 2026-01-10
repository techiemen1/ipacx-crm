
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const invoiceCount = await prisma.invoice.count();
    const customerCount = await prisma.customer.count();
    const projectCount = await prisma.project.count();
    const userCount = await prisma.user.count();

    console.log("--- DB COUNTS ---");
    console.log(`Invoices: ${invoiceCount}`);
    console.log(`Customers: ${customerCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Users: ${userCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
