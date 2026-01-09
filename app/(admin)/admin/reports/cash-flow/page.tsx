import { getCashFlowData } from "@/lib/report-actions"
import { CashFlowReport } from "@/components/admin/cash-flow-report"

export default async function Page() {
    const data = await getCashFlowData()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Cash Flow Projection</h2>
            <CashFlowReport data={data} />
        </div>
    )
}
