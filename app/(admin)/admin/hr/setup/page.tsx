import { prisma } from "@/lib/prisma"
import PayrollSetup from "@/components/admin/hr/payroll-setup"

export default async function Page() {
    const [departments, designations, payHeads, shifts] = await Promise.all([
        prisma.hRDepartment.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRDesignation.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRPayHead.findMany({ orderBy: { type: 'asc' } }),
        prisma.hRShift.findMany({ orderBy: { name: 'asc' } })
    ])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
            <p className="text-muted-foreground">Setup Departments, Designations, Shifts and Salary Components.</p>
            <PayrollSetup
                departments={departments}
                designations={designations}
                payHeads={payHeads}
                shifts={shifts}
            />
        </div>
    )
}
