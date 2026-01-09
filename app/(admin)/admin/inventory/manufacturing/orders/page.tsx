import { prisma } from "@/lib/prisma"
import ProductionOrderManagement from "@/components/admin/production-order-management"
import { getBOMs, getProductionOrders } from "@/lib/inventory-actions"

export default async function Page() {
    const [bomsRes, ordersRes, warehouses] = await Promise.all([
        getBOMs(),
        getProductionOrders(),
        prisma.warehouse.findMany({ orderBy: { name: 'asc' } })
    ])

    return <ProductionOrderManagement boms={bomsRes.data || []} orders={ordersRes.data || []} warehouses={warehouses} />
}
