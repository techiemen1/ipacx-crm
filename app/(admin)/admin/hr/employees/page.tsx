import { getEmployees } from "@/lib/hr-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, User, Building } from "lucide-react"

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
                    <Card key={emp.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{emp.firstName} {emp.lastName}</h3>
                                    <p className="text-sm text-muted-foreground">{emp.designation?.name || "No Designation"}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                    <Building className="mr-2 h-4 w-4" /> {emp.department?.name || "No Department"}
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span>Code: <span className="font-medium text-foreground">{emp.code}</span></span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {emp.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
