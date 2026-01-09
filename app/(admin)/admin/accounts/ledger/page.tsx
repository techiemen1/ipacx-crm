"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderTree, FileText } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getAccountHeads, getAccountGroups, createAccountGroup, createAccountHead } from "@/lib/accounting-actions"

export default function LedgerPage() {
    const [heads, setHeads] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [isGroupOpen, setIsGroupOpen] = useState(false)
    const [isLedgerOpen, setIsLedgerOpen] = useState(false)

    // Form states
    const [groupName, setGroupName] = useState("")
    const [groupType, setGroupType] = useState("ASSET")

    const [ledgerName, setLedgerName] = useState("")
    const [ledgerCode, setLedgerCode] = useState("")
    const [ledgerGroupId, setLedgerGroupId] = useState("")
    const [ledgerType, setLedgerType] = useState("Dr")

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const hRes = await getAccountHeads()
        if (hRes.data) setHeads(hRes.data)

        const gRes = await getAccountGroups()
        if (gRes.data) setGroups(gRes.data)
    }

    async function handleCreateGroup() {
        if (!groupName) return toast.error("Group name is required")
        const res = await createAccountGroup({ name: groupName, type: groupType })
        if (res.error) toast.error(res.error)
        else {
            toast.success("Group created")
            setIsGroupOpen(false)
            setGroupName("")
            loadData()
        }
    }

    async function handleCreateLedger() {
        if (!ledgerName || !ledgerGroupId) return toast.error("Name and Group are required")
        const res = await createAccountHead({
            name: ledgerName,
            code: ledgerCode,
            groupId: ledgerGroupId,
            type: ledgerType
        })
        if (res.error) toast.error(res.error)
        else {
            toast.success("Ledger created")
            setIsLedgerOpen(false)
            setLedgerName("")
            setLedgerCode("")
            loadData()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
                    <p className="text-muted-foreground">Manage your ledgers and account groups.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <FolderTree className="mr-2 h-4 w-4" /> New Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Account Group</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Group Name</Label>
                                    <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Current Assets" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={groupType} onValueChange={setGroupType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ASSET">Asset</SelectItem>
                                            <SelectItem value="LIABILITY">Liability</SelectItem>
                                            <SelectItem value="EQUITY">Equity</SelectItem>
                                            <SelectItem value="INCOME">Income</SelectItem>
                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateGroup} className="w-full">Create Group</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Ledger
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Ledger Account</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Ledger Name</Label>
                                    <Input value={ledgerName} onChange={e => setLedgerName(e.target.value)} placeholder="e.g. HDFC Bank" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code (Optional)</Label>
                                    <Input value={ledgerCode} onChange={e => setLedgerCode(e.target.value)} placeholder="e.g. 1001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Under Group</Label>
                                    <Select value={ledgerGroupId} onValueChange={setLedgerGroupId}>
                                        <SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger>
                                        <SelectContent>
                                            {groups.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.name} ({g.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Opening Balance Type</Label>
                                    <Select value={ledgerType} onValueChange={setLedgerType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr">Debit (Dr)</SelectItem>
                                            <SelectItem value="Cr">Credit (Cr)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateLedger} className="w-full">Create Ledger</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {heads.map((head) => (
                                <TableRow key={head.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        {head.name}
                                        {head.code && <span className="text-xs text-muted-foreground ml-2">({head.code})</span>}
                                    </TableCell>
                                    <TableCell>{head.group?.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs ${head.group?.type === 'ASSET' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {head.type || head.group?.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">₹ {head.currentBalance.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {heads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No accounts found. Run seed script or create one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
