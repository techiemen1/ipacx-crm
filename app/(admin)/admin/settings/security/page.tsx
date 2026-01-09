import { getRoles, isVaultSet } from "@/lib/security-actions"
import { SecuritySettings } from "@/components/admin/security-settings"

export default async function Page() {
    const roles = await getRoles()
    const vaultSet = await isVaultSet()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
            <SecuritySettings roles={roles} vaultSet={vaultSet} />
        </div>
    )
}
