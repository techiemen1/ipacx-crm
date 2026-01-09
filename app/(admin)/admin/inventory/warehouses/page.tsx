import { prisma } from "@/lib/prisma"
import WarehousePage from "@/components/admin/warehouse-list"

export default async function Page() {
    const warehouses = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } })
    return <WarehousePage initialWarehouses={warehouses} />
}
