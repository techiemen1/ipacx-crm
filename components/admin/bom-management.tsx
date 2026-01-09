"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { createBOM } from "@/lib/inventory-actions"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface BOMManagementProps {
    items: any[]
    boms: any[]
}

export default function BOMManagement({ items, boms }: BOMManagementProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<{
        name: string, itemId: string, laborCost: number, overheadCost: number,
        components: { itemId: string, quantity: number, wastePct: number }[]
    }>({
        name: "", itemId: "", laborCost: 0, overheadCost: 0,
        components: [{ itemId: "", quantity: 1, wastePct: 0 }]
    })
    const router = useRouter()

    const handleAddComponent = () => {
        setFormData({
            ...formData,
            components: [...formData.components, { itemId: "", quantity: 1, wastePct: 0 }]
        })
    }

    const handleRemoveComponent = (index: number) => {
        const newComponents = [...formData.components]
        newComponents.splice(index, 1)
        setFormData({ ...formData, components: newComponents })
    }

    const handleComponentChange = (index: number, field: string, value: any) => {
        const newComponents = [...formData.components]
        // @ts-ignore
        newComponents[index][field] = value
        setFormData({ ...formData, components: newComponents })
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.itemId) return toast.error("Name and Product required")
        if (formData.components.length === 0) return toast.error("Add at least one component")

        const res = await createBOM(formData)
        if (res.error) toast.error(res.error)
        else {
            toast.success("BOM Created")
            setOpen(false)
            setFormData({ name: "", itemId: "", laborCost: 0, overheadCost: 0, components: [{ itemId: "", quantity: 1, wastePct: 0 }] })
            router.refresh()
        }
    }

    // Cost Estimation
    const selectedProduct = items.find(i => i.id === formData.itemId)
    const componentCost = formData.components.reduce((acc, c) => {
        // Mock cost as 0 since we don't have cost price in Item yet (TODO: Add cost price field)
        return acc + 0
    }, 0)
    const totalCost = componentCost + formData.laborCost + formData.overheadCost

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manufacturing</h2>
                    <p className="text-muted-foreground">Manage Bill of Materials and Production Recipes.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create BOM</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Bill of Material</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>BOM Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Standard Production" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Finished Good</Label>
                                    <Select value={formData.itemId} onValueChange={v => setFormData({ ...formData, itemId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                                        <SelectContent>
                                            {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-sm">Raw Materials</h4>
                                    <Button variant="outline" size="sm" onClick={handleAddComponent}>+ Add Material</Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.components.map((c, idx) => (
                                        <div key={idx} className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Label className="text-xs">Item</Label>
                                                <Select value={c.itemId} onValueChange={v => handleComponentChange(idx, 'itemId', v)}>
                                                    <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs">Qty</Label>
                                                <Input type="number" className="h-8" value={c.quantity} onChange={e => handleComponentChange(idx, 'quantity', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs">Waste %</Label>
                                                <Input type="number" className="h-8" value={c.wastePct} onChange={e => handleComponentChange(idx, 'wastePct', parseFloat(e.target.value))} />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveComponent(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Labor Cost</Label>
                                    <Input type="number" value={formData.laborCost} onChange={e => setFormData({ ...formData, laborCost: parseFloat(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Overhead Cost</Label>
                                    <Input type="number" value={formData.overheadCost} onChange={e => setFormData({ ...formData, overheadCost: parseFloat(e.target.value) })} />
                                </div>
                            </div>

                            <Button className="w-full" onClick={handleSubmit}>Save BOM</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {boms.map(bom => (
                    <BOMCard key={bom.id} bom={bom} />
                ))}
            </div>
        </div>
    )
}

function BOMCard({ bom }: { bom: any }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Card>
            <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>
                        <div>
                            <CardTitle className="text-base">{bom.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">Item: {bom.item.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">Overheads: ₹{bom.laborCost + bom.overheadCost}</div>
                    </div>
                </div>
            </CardHeader>
            <Collapsible open={isOpen}>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Component</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Waste %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bom.components.map((c: any) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.item.name}</TableCell>
                                        <TableCell className="text-right">{c.quantity} {c.unit}</TableCell>
                                        <TableCell className="text-right">{c.wastePct}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
