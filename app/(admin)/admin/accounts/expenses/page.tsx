import { prisma } from "@/lib/prisma"
import { ExpenseManagement } from "@/components/admin/expense-management"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ExpensesPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const [expenses, vendors, projects] = await Promise.all([
        prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { vendor: { select: { name: true } } }
        }),
        prisma.vendor.findMany({
            select: { id: true, name: true }
        }),
        prisma.project.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ])

    return (
        <div className="space-y-6">
            <ExpenseManagement
                initialExpenses={expenses as any}
                vendors={vendors}
                currentUserId={session.user.id as string}
                projects={projects}
            />
        </div>
    )


}
