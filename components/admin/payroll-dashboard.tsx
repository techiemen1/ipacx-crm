"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generatePayslips } from "@/lib/payroll-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, FileText, CheckCircle } from "lucide-react"

export function PayrollDashboard({ slips, month, year }: { slips: any[], month: number, year: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Sync Select with URL
    function handleMonthChange(value: string) {
        const params = new URLSearchParams(window.location.search)
        params.set("month", value)
        // Keep existing year or default
        if (!params.get("year")) params.set("year", year.toString())
        router.push(`/admin/accounts/payroll?${params.toString()}`)
    }

    function handleYearChange(value: string) {
        const params = new URLSearchParams(window.location.search)
        params.set("year", value)
        if (!params.get("month")) params.set("month", month.toString())
        router.push(`/admin/accounts/payroll?${params.toString()}`)
    }

    async function handleGenerate() {
        setLoading(true)
        // Use props month/year
        const res = await generatePayslips(month, year)
        setLoading(false)

        if (res.success) {
            toast.success(`Generated ${res.count} payslips`)
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    const totalPayout = slips.reduce((sum, s) => sum + s.netSalary, 0)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <Select value={month.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleGenerate} disabled={loading || slips.length > 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {slips.length > 0 ? "Processed" : "Generate Payslips"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalPayout.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{slips.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {slips.length > 0 ? <span className="text-green-600 flex items-center"><CheckCircle className="mr-2 h-6 w-6" /> Completed</span> : <span className="text-slate-400">Pending</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslip Register</CardTitle>
                </CardHeader>
                <CardContent>
                    {slips.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No payslips generated for this period. Click "Generate" to process salaries.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="p-3 text-left font-medium">Employee</th>
                                        <th className="p-3 text-right font-medium">Basic</th>
                                        <th className="p-3 text-right font-medium">Allowances</th>
                                        <th className="p-3 text-right font-medium">Deductions</th>
                                        <th className="p-3 text-right font-medium">Net Salary</th>
                                        <th className="p-3 text-center font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {slips.map((slip) => (
                                        <tr key={slip.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium">{slip.employee?.firstName} {slip.employee?.lastName}</td>
                                            <td className="p-3 text-right">{slip.basic.toLocaleString()}</td>
                                            <td className="p-3 text-right">{(slip.hra + slip.allowances).toLocaleString()}</td>
                                            <td className="p-3 text-right text-red-600">{(slip.pf + slip.pt + slip.tds).toLocaleString()}</td>
                                            <td className="p-3 text-right font-bold">{slip.netSalary.toLocaleString()}</td>
                                            <td className="p-3 text-center">
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
