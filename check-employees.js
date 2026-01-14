
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const count = await prisma.employee.count()
    console.log(`Employees: ${count}`)
    const emps = await prisma.employee.findMany()
    console.log(JSON.stringify(emps, null, 2))
}
check()
