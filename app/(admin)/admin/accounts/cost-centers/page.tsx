"use client"

import { useState, useEffect } from "react"
import { getCostCenters, createCostCenter } from "@/lib/accounting-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Target } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function CostCentersPage() {
    const [centers, setCenters] = useState<any[]>([])
    const [newCenter, setNewCenter] = useState({ name: "", code: "", budget: "" })
    const [open, setOpen] = useState(false)

    useEffect(() => {
        loadCenters()
    }, [])

    const loadCenters = () => {
        getCostCenters().then(res => {
            if (res.data) setCenters(res.data)
        })
    }

    const handleCreate = async () => {
        if (!newCenter.name) return toast.error("Name is required")
        const res = await createCostCenter({
            name: newCenter.name,
            code: newCenter.code || undefined,
            budget: Number(newCenter.budget) || 0
        })
        if (res.success) {
            toast.success("Cost Center Created")
            setOpen(false)
            setNewCenter({ name: "", code: "", budget: "" })
            loadCenters()
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cost Centers</h1>
                    <p className="text-muted-foreground">Track expenses and revenue by project or department.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Cost Center
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Cost Center</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input value={newCenter.name} onChange={e => setNewCenter({ ...newCenter, name: e.target.value })} placeholder="e.g., Marketing Dept" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Code (Optional)</label>
                                <Input value={newCenter.code} onChange={e => setNewCenter({ ...newCenter, code: e.target.value })} placeholder="e.g., CC-001" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Budget</label>
                                <Input type="number" value={newCenter.budget} onChange={e => setNewCenter({ ...newCenter, budget: e.target.value })} placeholder="0.00" />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Cost Centers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-right">Budget</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {centers.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Target className="h-4 w-4 text-purple-500" />
                                        {c.name}
                                    </TableCell>
                                    <TableCell>{c.code || "-"}</TableCell>
                                    <TableCell className="text-right">₹ {c.budget.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {centers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No cost centers found. Create one to start tracking.
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
