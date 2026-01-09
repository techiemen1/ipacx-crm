"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Download, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { recordStockMovement } from "@/lib/inventory-actions"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface StockJournalProps {
    items: any[]
    warehouses: any[]
    history: any[]
}

export default function StockJournal({ items, warehouses, history }: StockJournalProps) {
    const [type, setType] = useState<"INWARD" | "OUTWARD" | "TRANSFER">("INWARD")
    const [formData, setFormData] = useState<{
        itemId: string, quantity: number, sourceWarehouseId: string, targetWarehouseId: string, notes: string,
        batchNumber?: string, expiryDate?: Date
    }>({
        itemId: "",
        quantity: 1,
        sourceWarehouseId: "",
        targetWarehouseId: "",
        notes: ""
    })
    const router = useRouter()

    const selectedItem = items.find(i => i.id === formData.itemId)

    const handleSubmit = async () => {
        if (!formData.itemId) return toast.error("Select an item")
        if (formData.quantity <= 0) return toast.error("Invalid quantity")
        if ((type === "OUTWARD" || type === "TRANSFER") && !formData.sourceWarehouseId) return toast.error("Source warehouse required")
        if ((type === "INWARD" || type === "TRANSFER") && !formData.targetWarehouseId) return toast.error("Target warehouse required")

        // Prevent same source/target
        if (type === "TRANSFER" && formData.sourceWarehouseId === formData.targetWarehouseId) {
            return toast.error("Source and Target cannot be same")
        }

        toast.info("Processing...")
        const res = await recordStockMovement({ ...formData, type })

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Stock updated successfully")
            setFormData({ itemId: "", quantity: 1, sourceWarehouseId: "", targetWarehouseId: "", notes: "" })
            router.refresh()
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Stock Journal</h1>
                <p className="text-muted-foreground">Record Inward, Outward, and Transfer of Materials.</p>
            </div>

            <Card>
                <CardHeader>
                    <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="INWARD" className="gap-2">
                                <Download className="h-4 w-4" /> Inward (Purchase)
                            </TabsTrigger>
                            <TabsTrigger value="OUTWARD" className="gap-2">
                                <Upload className="h-4 w-4" /> Outward (Consume)
                            </TabsTrigger>
                            <TabsTrigger value="TRANSFER" className="gap-2">
                                <ArrowRightLeft className="h-4 w-4" /> Transfer
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">

                    <div className="grid gap-2">
                        <Label>Select Item</Label>
                        <Select value={formData.itemId} onValueChange={(v) => setFormData({ ...formData, itemId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Search Item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map(i => (
                                    <SelectItem key={i.id} value={i.id}>
                                        {i.name} {i.sku ? `(${i.sku})` : ""} - Stock: {i.currentStock} {i.unit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {(type === "OUTWARD" || type === "TRANSFER") && (
                            <div className="grid gap-2">
                                <Label>Source Warehouse (From)</Label>
                                <Select value={formData.sourceWarehouseId} onValueChange={(v) => setFormData({ ...formData, sourceWarehouseId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(type === "INWARD" || type === "TRANSFER") && (
                            <div className="grid gap-2">
                                <Label>Target Warehouse (To)</Label>
                                <Select value={formData.targetWarehouseId} onValueChange={(v) => setFormData({ ...formData, targetWarehouseId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Quantity</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        />
                    </div>

                    {selectedItem?.isBatchTracked && (
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
                            <div className="grid gap-2">
                                <Label>Batch Number</Label>
                                <Input
                                    value={formData.batchNumber || ""}
                                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                    placeholder="e.g. BATCH-001"
                                />
                            </div>
                            {type === "INWARD" && (
                                <div className="grid gap-2">
                                    <Label>Expiry Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Notes / Reference</Label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="e.g. Invoice #123 or Project #A"
                        />
                    </div>

                    <Button className="w-full" onClick={handleSubmit}>
                        {type === "INWARD" ? "Record Stock Inward" : type === "OUTWARD" ? "Record Consumption" : "Transfer Stock"}
                    </Button>

                </CardContent>
            </Card>

            <div className="space-y-4 pt-6">
                <h2 className="text-xl font-semibold">Recent Movements</h2>
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Target</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No movements recorded yet.</TableCell>
                                </TableRow>
                            )}
                            {history.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={m.type === "INWARD" ? "default" : m.type === "OUTWARD" ? "destructive" : "secondary"}>
                                            {m.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{m.item?.name}</TableCell>
                                    <TableCell>{m.batch?.batchNumber || "-"}</TableCell>
                                    <TableCell className="font-bold">{m.quantity}</TableCell>
                                    <TableCell>{m.sourceWarehouse?.name || "-"}</TableCell>
                                    <TableCell>{m.targetWarehouse?.name || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
