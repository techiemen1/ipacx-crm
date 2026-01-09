import { CustomerManagement } from "@/components/admin/customer-management"
import { prisma } from "@/lib/prisma"
import { getPipelines } from "@/lib/crm-actions"

export default async function CustomersPage() {
    const [customers, pipelines] = await Promise.all([
        prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                projectInterest: true,
                address: true,
                gstin: true,
                pan: true,
                // Include other fields as needed by the interface
            }
        }),
        getPipelines()
    ])

    const activePipeline = pipelines.find(p => p.isDefault) || pipelines[0]
    const stages = activePipeline?.stages || []

    return (
        <div className="space-y-6">
            <CustomerManagement initialCustomers={customers as any} stages={stages} />
        </div>
    )
}
