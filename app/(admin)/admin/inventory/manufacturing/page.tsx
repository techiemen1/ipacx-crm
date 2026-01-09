import { prisma } from "@/lib/prisma"
import BOMManagement from "@/components/admin/bom-management"
import { getBOMs } from "@/lib/inventory-actions"

export default async function Page() {
    const [items, bomsRes] = await Promise.all([
        prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } }),
        getBOMs()
    ])

    return <BOMManagement items={items} boms={bomsRes.data || []} />
}
