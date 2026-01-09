import { getAttendanceSheet } from "@/lib/payroll-actions"
import { AttendanceSheet } from "@/components/admin/attendance-sheet"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function Page({ searchParams }: { searchParams: { date?: string } }) {
    const today = new Date()
    const dateParam = searchParams.date ? new Date(searchParams.date) : today
    const dateStr = dateParam.toISOString().split('T')[0]

    const employees = await getAttendanceSheet(dateParam)

    // Navigation
    const prevDate = new Date(dateParam)
    prevDate.setDate(prevDate.getDate() - 1)
    const nextDate = new Date(dateParam)
    nextDate.setDate(nextDate.getDate() + 1)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Daily Attendance</h2>
                <div className="flex items-center gap-2">
                    <Link href={`?date=${prevDate.toISOString().split('T')[0]}`}>
                        <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div className="flex items-center border rounded-md px-4 py-2 bg-card min-w-[200px] justify-center font-medium">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(dateParam, "dd MMMM yyyy")}
                    </div>
                    <Link href={`?date=${nextDate.toISOString().split('T')[0]}`}>
                        <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                    </Link>
                </div>
            </div>

            <AttendanceSheet employees={employees} date={dateStr} />
        </div>
    )
}
