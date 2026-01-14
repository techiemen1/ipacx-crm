
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const d = await prisma.hRDepartment.count()
    const des = await prisma.hRDesignation.count()
    console.log(`Departments: ${d}`)
    console.log(`Designations: ${des}`)
}
check()
