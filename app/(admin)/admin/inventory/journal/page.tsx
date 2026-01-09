import { prisma } from "@/lib/prisma"
import StockJournal from "@/components/admin/stock-journal"
import { getStockMovements } from "@/lib/inventory-actions"

export default async function Page() {
    const [items, warehouses, movementsRes] = await Promise.all([
        prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } }),
        prisma.warehouse.findMany({ orderBy: { name: 'asc' } }),
        getStockMovements()
    ])

    return <StockJournal items={items} warehouses={warehouses} history={movementsRes.data || []} />
}
