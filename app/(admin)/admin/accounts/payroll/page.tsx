import { getPayrollSummary } from "@/lib/payroll-actions"
import { PayrollDashboard } from "@/components/admin/payroll-dashboard"

export default async function Page({ searchParams }: { searchParams: { month?: string, year?: string } }) {
    const today = new Date()
    const month = searchParams.month ? parseInt(searchParams.month) : today.getMonth() + 1
    const year = searchParams.year ? parseInt(searchParams.year) : today.getFullYear()

    const slips = await getPayrollSummary(month, year)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Payroll Processing</h2>
            <PayrollDashboard slips={slips} month={month} year={year} />
        </div>
    )
}
