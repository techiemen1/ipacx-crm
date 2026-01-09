"use client"

import { useState } from "react"
import { verifyVaultPin } from "@/lib/security-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { toast } from "sonner"

export function VaultGuard({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [pin, setPin] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleUnlock() {
        if (!pin) return
        setLoading(true)
        const res = await verifyVaultPin(pin)
        setLoading(false)

        if (res.success) {
            setIsUnlocked(true)
        } else {
            toast.error("Incorrect PIN")
        }
    }

    if (isUnlocked) {
        return <>{children}</>
    }

    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Card className="w-[350px]">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-2">
                        <Lock className="h-6 w-6 text-slate-500" />
                    </div>
                    <CardTitle>Vault Locked</CardTitle>
                    <CardDescription>Enter PIN to access this module</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Enter PIN"
                        className="text-center text-lg tracking-widest"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <Button className="w-full" onClick={handleUnlock} disabled={loading}>
                        {loading ? "Verifying..." : "Unlock"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
