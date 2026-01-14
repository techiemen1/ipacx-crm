import { prisma } from "@/lib/prisma"
import { getEmployee } from "@/lib/hr-actions"
import { EmployeeForm } from "@/components/admin/employee-form"
import Link from "next/link"

export default async function EditEmployeePage(props: any) {
    let params
    try {
        params = await props.params
    } catch (e) {
        params = props.params
    }

    const id = params?.id

    if (!id) {
        return (
            <div className="p-10 space-y-4">
                <h1 className="text-xl font-bold text-red-600">Debug: Missing ID in URL</h1>
                <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs text-black">{JSON.stringify({ props, params }, null, 2)}</pre>
            </div>
        )
    }

    const empRes = await getEmployee(id)

    if (empRes.error || !empRes.data) {
        return (
            <div className="p-10 space-y-4">
                <h1 className="text-xl font-bold text-red-600">Debug: Employee Not Found in Database</h1>
                <p className="font-mono">ID: {id}</p>
                <p className="text-red-500">Error: {empRes.error}</p>
                <Link href="/admin/hr/employees" className="text-blue-600 underline">Back to List</Link>
                <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs text-black">{JSON.stringify({ empRes }, null, 2)}</pre>
            </div>
        )
    }

    const [departments, designations, shifts] = await Promise.all([
        prisma.hRDepartment.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRDesignation.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRShift.findMany({ orderBy: { name: 'asc' } })
    ])

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
            <EmployeeForm
                initialData={empRes.data}
                departments={departments}
                designations={designations}
                shifts={shifts}
            />
        </div>
    )
}
