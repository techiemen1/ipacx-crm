"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { createUom, deleteUom, createConversion, deleteConversion } from "@/lib/uom-actions"
import { useRouter } from "next/navigation"

interface UomProps {
    uoms: any[]
}

export default function UomManagement({ uoms }: UomProps) {
    const router = useRouter()

    // UoM State
    const [newUom, setNewUom] = useState({ name: "", symbol: "", type: "COUNT" })
    const [uomDialogOpen, setUomDialogOpen] = useState(false)

    // Conversion State
    const [conversion, setConversion] = useState({ fromUomId: "", toUomId: "", factor: 1 })
    const [convDialogOpen, setConvDialogOpen] = useState(false)

    async function handleCreateUom() {
        if (!newUom.name || !newUom.symbol) return toast.error("Name and Symbol required")
        const res = await createUom(newUom)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Unit Created")
            setUomDialogOpen(false)
            setNewUom({ name: "", symbol: "", type: "COUNT" })
            router.refresh()
        }
    }

    async function handleDeleteUom(id: string) {
        if (!confirm("Delete this unit?")) return
        const res = await deleteUom(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Unit Deleted")
            router.refresh()
        }
    }

    async function handleCreateConversion() {
        if (!conversion.fromUomId || !conversion.toUomId) return toast.error("Select both units")
        if (conversion.fromUomId === conversion.toUomId) return toast.error("Units must be different")

        const res = await createConversion(conversion)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Conversion Added")
            setConvDialogOpen(false)
            setConversion({ fromUomId: "", toUomId: "", factor: 1 })
            router.refresh()
        }
    }

    async function handleDeleteConversion(id: string) {
        if (!confirm("Remove this conversion?")) return
        const res = await deleteConversion(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Conversion Removed")
            router.refresh()
        }
    }

    // Flatten conversions for display
    const allConversions = uoms.flatMap(u => u.conversionsFrom.map((c: any) => ({
        id: c.id,
        fromName: u.name,
        fromSymbol: u.symbol,
        toName: c.toUom.name,
        toSymbol: c.toUom.symbol,
        factor: c.factor
    })))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Units of Measure</h2>
                    <p className="text-muted-foreground">Manage units and conversion factors.</p>
                </div>
            </div>

            <Tabs defaultValue="units" className="w-full">
                <TabsList>
                    <TabsTrigger value="units">Units</TabsTrigger>
                    <TabsTrigger value="conversions">Conversions</TabsTrigger>
                </TabsList>

                <TabsContent value="units" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Available Units</CardTitle>
                                <CardDescription>Base usage units for inventory items.</CardDescription>
                            </div>
                            <Dialog open={uomDialogOpen} onOpenChange={setUomDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">Add Unit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Unit</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Name</Label>
                                            <Input placeholder="e.g. Kilogram" value={newUom.name} onChange={e => setNewUom({ ...newUom, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Symbol</Label>
                                            <Input placeholder="e.g. kg" value={newUom.symbol} onChange={e => setNewUom({ ...newUom, symbol: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Type</Label>
                                            <Select value={newUom.type} onValueChange={v => setNewUom({ ...newUom, type: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="COUNT">Count (Nos, Box)</SelectItem>
                                                    <SelectItem value="MASS">Mass (Kg, Ton)</SelectItem>
                                                    <SelectItem value="VOLUME">Volume (Ltr, ml)</SelectItem>
                                                    <SelectItem value="LENGTH">Length (Mtr, Ft)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleCreateUom}>Save Unit</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uoms.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell>{u.symbol}</TableCell>
                                            <TableCell className="text-xs font-mono bg-slate-100 p-1 rounded w-fit">{u.type}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUom(u.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="conversions" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Conversion Rules</CardTitle>
                                <CardDescription>Define how units convert to each other (e.g., 1 Box = 10 Nos)</CardDescription>
                            </div>
                            <Dialog open={convDialogOpen} onOpenChange={setConvDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">Add Rule</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Conversion Rule</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="flex items-end gap-2">
                                            <div className="grid gap-2 flex-1">
                                                <Label>1 Unit of</Label>
                                                <Select onValueChange={v => setConversion({ ...conversion, fromUomId: v })}>
                                                    <SelectTrigger><SelectValue placeholder="From Unit" /></SelectTrigger>
                                                    <SelectContent>
                                                        {uoms.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="pb-3 text-lg font-bold">=</div>
                                            <div className="grid gap-2 flex-1">
                                                <Label>Factor</Label>
                                                <Input type="number" value={conversion.factor} onChange={e => setConversion({ ...conversion, factor: parseFloat(e.target.value) })} />
                                            </div>
                                            <div className="grid gap-2 flex-1">
                                                <Label>Units of</Label>
                                                <Select onValueChange={v => setConversion({ ...conversion, toUomId: v })}>
                                                    <SelectTrigger><SelectValue placeholder="To Unit" /></SelectTrigger>
                                                    <SelectContent>
                                                        {uoms.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground bg-slate-50 p-2 rounded">
                                            Example: 1 <strong>Box</strong> = 10 <strong>Nos</strong>
                                        </div>
                                        <Button onClick={handleCreateConversion}>Save Rule</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rule</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allConversions.map(c => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">1 {c.fromName}</span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    <span>{c.factor} {c.toName}s</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteConversion(c.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
