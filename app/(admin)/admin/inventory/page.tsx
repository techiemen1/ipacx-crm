import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InventoryManagement } from "@/components/admin/inventory-management"
import { StockNotifications } from "@/components/admin/stock-notifications"
import Link from "next/link"

export default async function InventoryPage() {
    const session = await auth()
    if (!session) return null

    // Fetch construction materials
    const items = await prisma.inventoryItem.findMany({
        orderBy: { updatedAt: 'desc' }
    })

    // Low Stock Alert
    const lowStockItems = items.filter(i => i.currentStock <= (i.minLevel || 0))

    // Expiry Alert (Next 30 days) - Requires Batches
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)

    const expiringBatches = await prisma.inventoryBatch.findMany({
        where: {
            quantity: { gt: 0 },
            expiryDate: {
                lte: futureDate,
                gte: today
            }
        },
        include: { item: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Construction Inventory</h1>
                <p className="text-muted-foreground">Manage raw materials, stock levels, and procurement.</p>
            </div>

            <StockNotifications lowStockItems={lowStockItems} expiringBatches={expiringBatches} />

            <div className="grid gap-4 md:grid-cols-4">
                <div role="button" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold mb-2">Total Value</h3>
                    <div className="text-2xl font-bold">₹12.5L</div>
                </div>
                <Link href="/admin/inventory/items" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold mb-2">Items & Groups</h3>
                    <p className="text-sm text-muted-foreground">Manage SKUs, categories</p>
                </Link>
                <Link href="/admin/inventory/warehouses" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold mb-2">Warehouses</h3>
                    <p className="text-sm text-muted-foreground">Manage storage locations</p>
                </Link>
                <Link href="/admin/inventory/journal" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold mb-2">Stock Journal</h3>
                    <p className="text-sm text-muted-foreground">Inward, Consumption, Transfer</p>
                </Link>
                <Link href="/admin/inventory/manufacturing" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold mb-2">Manufacturing</h3>
                    <p className="text-sm text-muted-foreground">BOM & Job Work</p>
                </Link>
            </div>

            <InventoryManagement initialItems={items} />
        </div>
    )
}
