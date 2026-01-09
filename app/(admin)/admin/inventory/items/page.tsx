import { prisma } from "@/lib/prisma"
import InventoryItemsManagement from "@/components/admin/inventory-items-management"

export default async function Page() {
    const [items, groups] = await Promise.all([
        prisma.inventoryItem.findMany({
            include: { group: true },
            orderBy: { name: 'asc' }
        }),
        prisma.inventoryGroup.findMany({ orderBy: { name: 'asc' } })
    ])

    return <InventoryItemsManagement items={items} groups={groups} />
}
