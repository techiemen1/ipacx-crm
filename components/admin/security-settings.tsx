"use client"

import { useState } from "react"
import { setVaultPin, createRole, isVaultSet } from "@/lib/security-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Shield, Lock, Key } from "lucide-react"

export function SecuritySettings({ roles, vaultSet }: { roles: any[], vaultSet: boolean }) {
    const [pin, setPin] = useState("")
    const [roleName, setRoleName] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSetPin() {
        if (pin.length < 4) return toast.error("PIN too short")
        setLoading(true)
        const res = await setVaultPin(pin)
        setLoading(false)
        if (res.success) {
            toast.success("Vault PIN Set")
            setPin("")
        } else {
            toast.error("Failed to set PIN")
        }
    }

    async function handleAddRole() {
        if (!roleName) return
        setLoading(true)
        // Mock permissions for now - ideally a checklist
        const res = await createRole(roleName, ["VIEW_DASHBOARD", "VIEW_REPORTS"])
        setLoading(false)
        if (res.success) {
            toast.success("Role Created")
            setRoleName("")
        } else {
            toast.error("Failed")
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Tally Vault (App Lock)
                    </CardTitle>
                    <CardDescription>
                        Set a PIN to secure sensitive modules like Payroll and Banking.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${vaultSet ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-sm text-muted-foreground">{vaultSet ? "Protection Active" : "No PIN Set"}</span>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                        <Button onClick={handleSetPin} disabled={loading}>Set PIN</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" /> Role Management
                    </CardTitle>
                    <CardDescription>
                        Define roles and permissions for staff members.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Role Name (e.g. Manager)"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                        <Button onClick={handleAddRole} disabled={loading} variant="secondary">Add Role</Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Existing Roles</h4>
                        <div className="grid gap-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center justify-between p-2 border rounded bg-slate-50 text-sm">
                                    <span>{role.name}</span>
                                    <span className="text-xs text-muted-foreground">{role._count?.users || 0} Users</span>
                                </div>
                            ))}
                            {roles.length === 0 && <div className="text-muted-foreground text-xs">No custom roles defined.</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
