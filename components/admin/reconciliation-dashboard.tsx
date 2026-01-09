"use client"

import { useState } from "react"
import { uploadStatement, reconcileTransaction } from "@/lib/banking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Check, Upload } from "lucide-react"
import { format } from "date-fns"

interface ReconciliationProps {
    data: any
}

export function ReconciliationDashboard({ data }: ReconciliationProps) {
    const { account, statementLines, systemVouchers } = data
    const [selectedLine, setSelectedLine] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Handle CSV Upload (Mock for now, or basic parsing)
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const text = event.target?.result as string
            // Basic CSV Parse: Date, Description, Amount, Ref (Headerless assumption for now or 1st line header)
            // Ideally use a library like PapaParse in real app.
            // Mocking logic: Split lines, assume col 0=Date, 1=Desc, 2=Amount
            const rows = text.split('\n').slice(1).filter(r => r.trim())
            const parsed = rows.map(r => {
                const cols = r.split(',')
                return {
                    date: cols[0],
                    description: cols[1],
                    amount: cols[2],
                    type: parseFloat(cols[2]) > 0 ? "Credit" : "Debit",
                    refNo: cols[3] || ""
                }
            })

            const res = await uploadStatement(account.id, parsed)
            if (res.success) toast.success("Statement Uploaded")
            else toast.error("Failed to upload")
            setIsUploading(false)
        }
        reader.readAsText(file)
    }

    async function handleMatch(voucherId: string) {
        if (!selectedLine) return
        const res = await reconcileTransaction(selectedLine, voucherId)
        if (res.success) {
            toast.success("Transaction Reconciled")
            setSelectedLine(null)
            // Optimistic update could happen here, or just wait for revalidate
        } else {
            toast.error("Failed to reconcile")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Reconciliation: {account.name}</h2>
                    <p className="text-muted-foreground">Match bank statement lines with system records.</p>
                </div>
                <div className="flex gap-2">
                    <Input type="file" accept=".csv" className="w-[300px]" onChange={handleFileUpload} disabled={isUploading} />
                    <Button variant="outline" disabled={isUploading}>
                        <Upload className="mr-2 h-4 w-4" /> Import Statement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 h-[600px]">
                {/* Left: Statement Lines */}
                <Card className="flex flex-col">
                    <CardHeader className="py-3 bg-muted/30">
                        <CardTitle className="text-sm font-medium">Bank Statement Lines ({statementLines.length})</CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-auto p-0">
                        <div className="divide-y">
                            {statementLines.map((line: any) => (
                                <div
                                    key={line.id}
                                    className={`p-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${selectedLine === line.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                    onClick={() => setSelectedLine(line.id)}
                                >
                                    <div className="flex justify-between font-medium">
                                        <span>{format(new Date(line.date), "dd MMM yyyy")}</span>
                                        <span className={line.amount > 0 ? "text-green-600" : "text-red-600"}>
                                            {line.amount > 0 ? "+" : ""}
                                            {parseFloat(line.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate w-[90%]">{line.description}</div>
                                    {line.refNo && <div className="text-xs text-slate-500">Ref: {line.refNo}</div>}
                                </div>
                            ))}
                            {statementLines.length === 0 && <div className="p-10 text-center text-muted-foreground">All caught up! No Pending Lines.</div>}
                        </div>
                    </div>
                </Card>

                {/* Right: System Vouchers */}
                <Card className="flex flex-col">
                    <CardHeader className="py-3 bg-muted/30">
                        <CardTitle className="text-sm font-medium">Unreconciled System Entries ({systemVouchers.length})</CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-auto p-0">
                        <div className="divide-y">
                            {systemVouchers.map((entry: any) => (
                                <div key={entry.id} className="p-3 text-sm flex items-center justify-between group hover:bg-slate-50">
                                    <div className="flex-1">
                                        <div className="flex justify-between font-medium">
                                            <span>{format(new Date(entry.voucher.date), "dd MMM yyyy")}</span>
                                            <span className={entry.debit > 0 ? "text-red-600" : "text-green-600"}>
                                                {/* Logic: If entry is Debit to Bank, it means Money Out (-ve in bank view), Credit is Money In (+ve) */}
                                                {/* Typically: Dr Bank = Money In. Cr Bank = Money Out. */}
                                                {/* In Statement: Money In = Credit (+ve). Money Out = Debit (-ve). */}
                                                {/* So: Dr Bank Entry matches Credit Statement Line. Cr Bank matches Debit Line. */}

                                                {entry.debit > 0 ? "-" : "+"}{entry.debit > 0 ? entry.debit.toLocaleString() : entry.credit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{entry.voucher.narration || "No narration"}</div>
                                        <div className="text-xs text-slate-500">Vch: {entry.voucher.voucherNo}</div>
                                    </div>
                                    {selectedLine && (
                                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-green-600" onClick={() => handleMatch(entry.voucher.id)}>
                                            <Check className="h-4 w-4" /> Match
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {systemVouchers.length === 0 && <div className="p-10 text-center text-muted-foreground">No matching vouchers found.</div>}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
