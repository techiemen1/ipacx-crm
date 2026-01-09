import { getReconciliationData } from "@/lib/banking-actions"
import { ReconciliationDashboard } from "@/components/admin/reconciliation-dashboard"

export default async function Page({ params }: { params: { id: string } }) {
    const data = await getReconciliationData(params.id)

    if ('error' in data) {
        return <div>Error loading data: {data.error}</div>
    }

    return <ReconciliationDashboard data={data} />
}
