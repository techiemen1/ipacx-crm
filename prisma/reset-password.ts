import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)

    try {
        const user = await prisma.user.update({
            where: { email: 'admin@bhunethri.in' },
            data: { password }
        })
        console.log('Password reset successfully for:', user.email)
    } catch (e) {
        console.error('Error resetting password:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
