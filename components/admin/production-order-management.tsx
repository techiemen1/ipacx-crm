"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, PlayCircle, StopCircle, Calendar } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createProductionOrder, updateProductionOrderStatus } from "@/lib/inventory-actions"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ProductionOrderManagementProps {
    boms: any[]
    orders: any[]
    warehouses: any[]
}

export default function ProductionOrderManagement({ boms, orders, warehouses }: ProductionOrderManagementProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<{
        bomId: string, quantity: number, notes: string, startDate?: string, endDate?: string,
        sourceWarehouseId: string, targetWarehouseId: string
    }>({
        bomId: "", quantity: 1, notes: "", startDate: "", endDate: "",
        sourceWarehouseId: "", targetWarehouseId: ""
    })
    const router = useRouter()

    const handleSubmit = async () => {
        if (!formData.bomId) return toast.error("Select a BOM")
        if (formData.quantity <= 0) return toast.error("Quantity must be positive")
        if (!formData.sourceWarehouseId) return toast.error("Select Source Warehouse")
        if (!formData.targetWarehouseId) return toast.error("Select Target Warehouse")

        const res = await createProductionOrder({
            ...formData,
            startDate: formData.startDate ? new Date(formData.startDate) : undefined,
            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        })

        if (res.error) toast.error(res.error)
        else {
            toast.success("Production Order Created")
            setOpen(false)
            setFormData({ bomId: "", quantity: 1, notes: "", startDate: "", endDate: "", sourceWarehouseId: "", targetWarehouseId: "" })
            router.refresh()
        }
    }

    const handleStatusChange = async (id: string, status: string) => {
        const res = await updateProductionOrderStatus(id, status)
        if (res.error) toast.error(res.error)
        else {
            toast.success(`Order marked as ${status}`)
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Production Orders</h2>
                    <p className="text-muted-foreground">Manage Manufacturing Jobs and Work Orders.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Production Order</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Production Order</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Bill of Material (Recipe)</Label>
                                <Select value={formData.bomId} onValueChange={(v) => setFormData({ ...formData, bomId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select BOM" /></SelectTrigger>
                                    <SelectContent>
                                        {boms.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name} (Output: {b.item.name})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Quantity to Produce</Label>
                                <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Source Warehouse (Raw Materials)</Label>
                                    <Select value={formData.sourceWarehouseId} onValueChange={(v) => setFormData({ ...formData, sourceWarehouseId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Target Warehouse (Finished Goods)</Label>
                                    <Select value={formData.targetWarehouseId} onValueChange={(v) => setFormData({ ...formData, targetWarehouseId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Target" /></SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                            <Button className="w-full" onClick={handleSubmit}>Create Order</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active production orders.</TableCell>
                            </TableRow>
                        )}
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">{order.orderNumber}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{order.bom?.item.name}</div>
                                    <div className="text-xs text-muted-foreground">{order.bom?.name}</div>
                                </TableCell>
                                <TableCell className="font-bold">{order.quantity}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === "COMPLETED" ? "default" : order.status === "IN_PROGRESS" ? "secondary" : "outline"}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {order.startDate ? new Date(order.startDate).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {order.status === "PLANNED" && (
                                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}>
                                            <PlayCircle className="mr-2 h-3 w-3" /> Start
                                        </Button>
                                    )}
                                    {order.status === "IN_PROGRESS" && (
                                        <Button size="sm" onClick={() => handleStatusChange(order.id, "COMPLETED")}>
                                            <CheckCircle className="mr-2 h-3 w-3" /> Complete
                                        </Button>
                                    )}
                                    {order.status === "IN_PROGRESS" && (
                                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(order.id, "CANCELLED")}>
                                            <StopCircle className="h-3 w-3" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
