import { getEmployees } from "@/lib/hr-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeCard } from "@/components/admin/employee-card"

export default async function Page() {
    const { data: employees } = await getEmployees()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                <Link href="/admin/hr/employees/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees?.map((emp: any) => (
                    <EmployeeCard key={emp.id} emp={emp} />
                ))}
            </div>

            {(!employees || employees.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No employees found. Add your first employee.</p>
                </div>
            )}
        </div>
    )
}
