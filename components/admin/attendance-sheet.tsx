"use client"

import { useState } from "react"
import { markAttendance } from "@/lib/payroll-actions"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { format } from "date-fns"

interface AttendanceSheetProps {
    employees: any[]
    date: string // ISO Date String
}

export function AttendanceSheet({ employees, date }: AttendanceSheetProps) {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleStatusChange(employeeId: string, status: string) {
        setLoading(employeeId)
        try {
            await markAttendance({
                employeeId,
                date: new Date(date),
                status,
                checkIn: status === 'Present' ? new Date(`${date}T09:00:00`) : undefined,
                checkOut: status === 'Present' ? new Date(`${date}T18:00:00`) : undefined,
            })
            toast.success("Saved")
        } catch {
            toast.error("Failed")
        }
        setLoading(null)
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 font-medium border-b">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Department</th>
                        <th className="p-4 w-[200px]">Status</th>
                        <th className="p-4 w-[150px]">Check In</th>
                        <th className="p-4 w-[150px]">Check Out</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {employees.map((emp) => {
                        // Find attendance record for today if exists
                        const record = emp.attendance[0]
                        const status = record?.status || "Unmarked"

                        return (
                            <tr key={emp.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{emp.firstName} {emp.lastName}</td>
                                <td className="p-4 text-muted-foreground">{emp.department}</td>
                                <td className="p-4">
                                    <Select
                                        defaultValue={status}
                                        onValueChange={(val) => handleStatusChange(emp.id, val)}
                                        disabled={loading === emp.id}
                                    >
                                        <SelectTrigger className={
                                            status === 'Present' ? "text-green-600 border-green-200 bg-green-50" :
                                                status === 'Absent' ? "text-red-600 border-red-200 bg-red-50" :
                                                    status === 'Leave' ? "text-yellow-600 border-yellow-200 bg-yellow-50" : ""
                                        }>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Present">Present</SelectItem>
                                            <SelectItem value="Absent">Absent</SelectItem>
                                            <SelectItem value="Leave">Leave</SelectItem>
                                            <SelectItem value="Half-Day">Half-Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {record?.checkIn ? format(new Date(record.checkIn), "HH:mm") : "-"}
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {record?.checkOut ? format(new Date(record.checkOut), "HH:mm") : "-"}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
