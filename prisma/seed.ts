import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import "dotenv/config"

console.log("Database URL:", process.env.DATABASE_URL)

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error']
})

async function main() {
    // 1. Create Users
    const password = await hash('password123', 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@bhunethri.in' },
        update: { password },
        create: {
            email: 'admin@bhunethri.in',
            name: 'Super Admin',
            password,
            role: 'ADMIN',
            profile: {
                create: {
                    phone: '+91 8884050999',
                    designation: 'Director',
                    department: 'Management'
                }
            }
        },
    })

    const architect = await prisma.user.upsert({
        where: { email: 'architect@bhunethri.in' },
        update: { password },
        create: {
            email: 'architect@bhunethri.in',
            name: 'Sneha Reddy',
            password,
            role: 'ARCHITECT',
            profile: {
                create: {
                    phone: '+91 9876543210',
                    designation: 'Senior Architect',
                    department: 'Design',
                    salary: 75000
                }
            }
        },
    })

    // 2. Create Projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Lakshmi Nivas',
            location: 'K R Pura, Bangalore',
            status: 'Completed',
            type: 'Apartment',
            unitsTotal: 20,
            unitsSold: 18,
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000'
        }
    })

    const project2 = await prisma.project.create({
        data: {
            name: 'Varnasi Layout',
            location: 'Varnasi, Bangalore',
            status: 'In Progress',
            type: 'Plot',
            unitsTotal: 50,
            unitsSold: 12,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000'
        }
    })

    // 3. Create Customers & Invoices
    const customer1 = await prisma.customer.create({
        data: {
            name: 'Rahul Sharma',
            email: 'rahul.s@gmail.com',
            phone: '+91 9988776655',
            status: 'Customer',
            purchasedUnit: 'Flat 101 - Lakshmi Nivas',
            invoices: {
                create: {
                    invoiceNo: 'INV-2024-001',
                    amount: 250000,
                    totalAmount: 250000,
                    status: 'Paid',
                    dueDate: new Date(),
                    invoiceItems: {
                        create: [
                            { description: 'Booking Amount', quantity: 1, rate: 250000, amount: 250000, taxRate: 0 }
                        ]
                    }
                }
            }
        }
    })

    console.log({ admin, architect, project1, project2, customer1 })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
