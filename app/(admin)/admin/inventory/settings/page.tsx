import { getUoms } from "@/lib/uom-actions"
import UomManagement from "@/components/admin/uom-management"
import { Separator } from "@/components/ui/separator"

export default async function InventorySettingsPage() {
    const { data: uoms } = await getUoms()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inventory Settings</h1>
                <p className="text-muted-foreground">Configure advanced inventory options.</p>
            </div>
            <Separator />

            <UomManagement uoms={uoms || []} />
        </div>
    )
}
