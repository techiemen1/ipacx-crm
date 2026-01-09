"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash, Plus } from "lucide-react"
import { createVoucher, getAccountHeads, getCostCenters } from "@/lib/accounting-actions"
import { toast } from "sonner"
const CURRENCIES = ["INR", "USD", "EUR", "AED"]

export function VoucherForm({ onSuccess }: { onSuccess: () => void }) {
    const [heads, setHeads] = useState<any[]>([])
    const [costCenters, setCostCenters] = useState<any[]>([])
    const [type, setType] = useState("PAYMENT")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [narration, setNarration] = useState("")
    const [entries, setEntries] = useState([
        { accountId: "", debit: 0, credit: 0, currency: "INR", exchangeRate: 1, costCenterId: "" },
        { accountId: "", debit: 0, credit: 0, currency: "INR", exchangeRate: 1, costCenterId: "" }
    ])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getAccountHeads().then(res => {
            if (res.data) setHeads(res.data)
        })
        getCostCenters().then(res => {
            if (res.data) setCostCenters(res.data)
        })
    }, [])

    const addEntry = () => {
        setEntries([...entries, { accountId: "", debit: 0, credit: 0, currency: "INR", exchangeRate: 1, costCenterId: "" }])
    }

    const removeEntry = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index))
    }

    const updateEntry = (index: number, field: string, value: any) => {
        const newEntries = [...entries]
        // @ts-ignore
        newEntries[index][field] = value
        setEntries(newEntries)
    }

    const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0)
    const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

    const handleSubmit = async () => {
        if (!isBalanced) return toast.error("Entries are not balanced (Debit != Credit)")
        if (entries.some(e => !e.accountId)) return toast.error("Select accounts for all entries")

        setLoading(true)
        try {
            const res = await createVoucher({
                date: new Date(date),
                type,
                narration,
                entries: entries.map(e => ({
                    accountId: e.accountId,
                    debit: Number(e.debit),
                    credit: Number(e.credit),
                    currency: e.currency,
                    exchangeRate: Number(e.exchangeRate),
                    costCenterId: e.costCenterId || null
                }))
            })

            if (res.error) toast.error(res.error)
            else {
                toast.success("Voucher Posted Successfully")
                onSuccess()
                // Reset form
                setNarration("")
                setEntries([
                    { accountId: "", debit: 0, credit: 0, currency: "INR", exchangeRate: 1, costCenterId: "" },
                    { accountId: "", debit: 0, credit: 0, currency: "INR", exchangeRate: 1, costCenterId: "" }
                ])
            }
        } catch (e) {
            toast.error("Failed to post voucher")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Voucher Type</label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PAYMENT">Payment</SelectItem>
                            <SelectItem value="RECEIPT">Receipt</SelectItem>
                            <SelectItem value="CONTRA">Contra</SelectItem>
                            <SelectItem value="JOURNAL">Journal</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                            <SelectItem value="PURCHASE">Purchase</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
            </div>

            <div className="border rounded-md p-4 bg-slate-50 space-y-3">
                <div className="flex font-medium text-xs text-slate-500 uppercase tracking-wider mb-2">
                    <div className="flex-1">Account</div>
                    <div className="w-32 text-right px-2">Debit</div>
                    <div className="w-32 text-right px-2">Credit</div>
                    <div className="w-10"></div>
                </div>

                {entries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1">
                            <Select
                                value={entry.accountId}
                                onValueChange={(val) => updateEntry(index, 'accountId', val)}
                            >
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Account" /></SelectTrigger>
                                <SelectContent>
                                    {heads.map(h => (
                                        <SelectItem key={h.id} value={h.id}>{h.name} ({h.group.name})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input
                            className="w-32 text-right bg-white"
                            type="number"
                            placeholder="Dr"
                            value={entry.debit || ""}
                            onChange={e => updateEntry(index, 'debit', e.target.value)}
                        />
                        <Input
                            className="w-32 text-right bg-white"
                            type="number"
                            placeholder="Cr"
                            value={entry.credit || ""}
                            onChange={e => updateEntry(index, 'credit', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeEntry(index)} disabled={entries.length <= 2}>
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}

                <Button variant="outline" size="sm" onClick={addEntry} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Line
                </Button>
            </div>

            <div className="flex justify-between items-center text-sm font-medium p-2 bg-slate-100 rounded">
                <span>Totals</span>
                <div className="flex gap-4 mr-10">
                    <span className={isBalanced ? "text-green-600" : "text-red-600"}>Dr: {totalDebit.toFixed(2)}</span>
                    <span className={isBalanced ? "text-green-600" : "text-red-600"}>Cr: {totalCredit.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Narration</label>
                <Input value={narration} onChange={e => setNarration(e.target.value)} placeholder="Enter details..." />
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSubmit} disabled={!isBalanced || loading}>
                    {loading ? "Posting..." : "Post Voucher"}
                </Button>
            </div>
        </div>
    )
}
