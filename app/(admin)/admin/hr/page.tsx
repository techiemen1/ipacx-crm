import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Clock, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { auth } from "@/auth"
import { hasPermission, getRedirectPath } from "@/lib/rbac"
import { redirect } from "next/navigation"

export default async function HRPage() {
    const session = await auth()
    if (!session?.user) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role

    if (!hasPermission(userRole, "HR")) {
        redirect(getRedirectPath(userRole))
    }

    const staff = await prisma.employee.findMany({
        include: { designation: true, department: true },
        orderBy: { firstName: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
                    <p className="text-muted-foreground">Manage staff, attendance, and departments.</p>
                </div>
                <div className="space-x-2">

                    <Link href="/admin/hr/employees/new">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/hr/employees">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{staff.length}</div>
                            <p className="text-xs text-muted-foreground">Active Employees</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/hr/attendance">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">Mark Daily Attendance</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/hr/leave">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Planned Leaves</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="rounded-md border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Staff Directory</h3>
                </div>
                {staff.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        No staff members found. Add employees to get started.
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Code</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Designation</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {staff.map((employee) => (
                                    <tr key={employee.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-mono text-xs">{employee.code}</td>
                                        <td className="p-4 align-middle font-medium">{employee.firstName} {employee.lastName}</td>
                                        <td className="p-4 align-middle">{employee.email}</td>
                                        <td className="p-4 align-middle">{employee.department?.name || "-"}</td>
                                        <td className="p-4 align-middle">{employee.designation?.name || "-"}</td>
                                        <td className="p-4 align-middle">{employee.phone || "-"}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    )
}
