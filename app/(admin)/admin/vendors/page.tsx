import { prisma } from "@/lib/prisma"
import { VendorManagement } from "@/components/admin/vendor-management"

export default async function VendorsPage() {
    const vendors = await prisma.vendor.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <VendorManagement initialVendors={vendors} />
        </div>
    )
}
