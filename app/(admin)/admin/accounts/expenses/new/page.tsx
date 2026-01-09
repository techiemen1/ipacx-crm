import { ExpenseForm } from "@/components/forms/expense-form"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export default async function NewExpensePage() {
    const session = await auth()
    const projects = await prisma.project.findMany({ select: { id: true, name: true } })
    const vendors = await prisma.vendor.findMany({ select: { id: true, name: true } })

    return (
        <div className="max-w-2xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Record New Expense</h1>
            <ExpenseForm
                userId={session?.user?.id || ""}
                projects={projects}
                vendors={vendors}
            />
        </div>
    )
}
