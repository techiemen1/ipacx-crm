"use client"

import { useState } from "react"
import { Plus, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { processPayrollAction } from "@/lib/accounting-actions"

interface StaffMember {
    id: string
    name: string
    role: string
    basic: number
    hra: number
    total: number
    status: string
}

export function PayrollClient({ initialStaff }: { initialStaff: StaffMember[] }) {
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
    const [processing, setProcessing] = useState(false)

    async function handleProcessPayroll() {
        const pendingStaff = staff.filter(s => s.status === "Pending")
        if (pendingStaff.length === 0) {
            return toast.info("All salaries are already marked as Paid.")
        }

        if (!confirm("Are you sure you want to process payroll for all pending employees? This will create payment vouchers.")) return

        setProcessing(true)
        try {
            const res = await processPayrollAction(pendingStaff.map(s => s.id))

            if (res.error) {
                toast.error(res.error)
            } else {
                setStaff(staff.map(s => ({ ...s, status: "Paid" })))
                toast.success(`Payroll processed for ${res.count} employees. Total: ₹${res.total?.toLocaleString()}`)
            }
        } catch (e) {
            toast.error("Failed to process payroll")
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payroll & Salaries</h1>
                <Button
                    onClick={handleProcessPayroll}
                    disabled={processing}
                    className="bg-primary hover:bg-primary/90"
                >
                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Process Payroll ({new Date().toLocaleString('default', { month: 'long' })})
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Basic Pay</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Allowances</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Salary</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {staff.map((s) => (
                                <tr key={s.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{s.name}</td>
                                    <td className="p-4 align-middle">{s.role}</td>
                                    <td className="p-4 align-middle">₹ {s.basic.toLocaleString()}</td>
                                    <td className="p-4 align-middle">₹ {s.hra.toLocaleString()}</td>
                                    <td className="p-4 align-middle font-bold">₹ {s.total.toLocaleString()}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {s.status === 'Paid' && <Check className="h-3 w-3" />}
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No staff members found. Add users with salary details in Settings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
