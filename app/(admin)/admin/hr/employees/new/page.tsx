import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "@/components/admin/employee-form"

export default async function Page() {
    const [departments, designations, shifts] = await Promise.all([
        prisma.hRDepartment.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRDesignation.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRShift.findMany({ orderBy: { name: 'asc' } })
    ])

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Add New Employee</h2>
            <EmployeeForm
                departments={departments}
                designations={designations}
                shifts={shifts}
            />
        </div>
    )
}
