"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Building, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { deleteEmployee } from "@/lib/hr-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function EmployeeCard({ emp }: { emp: any }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this employee?")) {
            const res = await deleteEmployee(emp.id)
            if (res.success) {
                toast.success("Employee deleted")
                // router.refresh() // Valid in client component
            } else {
                toast.error(res.error)
            }
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{emp.firstName} {emp.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{emp.designation?.name || "No Designation"}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/hr/employees/${emp.id}`}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
    )
}
