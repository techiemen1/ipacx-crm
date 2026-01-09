import { prisma } from "@/lib/prisma"
import { CRMView } from "@/components/admin/crm/crm-view"
import { DealDialog } from "@/components/admin/crm/deal-dialog"
import { CustomerDialog } from "@/components/admin/crm/customer-dialog"
import { getDeals, getPipelines } from "@/lib/crm-actions"

export default async function CRMPage() {
    const pipelines = await getPipelines()
    const activePipeline = pipelines.find(p => p.isDefault) || pipelines[0]

    const [deals, customers] = await Promise.all([
        getDeals(activePipeline?.id),
        prisma.customer.findMany({ orderBy: { name: 'asc' } })
    ])

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
                    <p className="text-muted-foreground">{activePipeline?.name || "Manage your deals"}</p>
                </div>
                <div className="flex items-center gap-2">
                    <CustomerDialog />
                    {activePipeline && (
                        <DealDialog
                            customers={customers}
                            stages={activePipeline.stages}
                        />
                    )}
                </div>
            </div>

            {activePipeline ? (
                <div className="flex-1 overflow-hidden">
                    <CRMView pipeline={activePipeline} deals={deals} />
                </div>
            ) : (
                <div className="p-10 text-center text-muted-foreground">
                    No pipeline configured.
                </div>
            )}
        </div>
    )
}
