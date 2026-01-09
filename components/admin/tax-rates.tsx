"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createTaxRate, deleteTaxRate } from "@/lib/tax-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Trash2, Plus } from "lucide-react"

interface TaxRate {
    id: string
    name: string
    rate: number
    type: string
    cgst: number
    sgst: number
    igst: number
}

interface TaxRatesProps {
    initialRates: TaxRate[]
}

export function TaxRatesManagement({ initialRates }: TaxRatesProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        rate: 0,
        type: "GST",
        cgst: 0,
        sgst: 0,
        igst: 0
    })

    // Auto-calculate splits for GST
    const handleRateChange = (val: number) => {
        const split = val / 2
        setFormData(prev => ({
            ...prev,
            rate: val,
            cgst: prev.type === "GST" ? split : 0,
            sgst: prev.type === "GST" ? split : 0,
            igst: prev.type === "GST" ? val : 0
        }))
    }

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Name is required")

        const res = await createTaxRate(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Tax Rate Created")
            setOpen(false)
            router.refresh()
            setFormData({ name: "", rate: 0, type: "GST", cgst: 0, sgst: 0, igst: 0 })
        }
    }

    const handleDelete = async (id: string) => {
        const res = await deleteTaxRate(id)
        if (res.success) {
            toast.success("Deleted")
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Tax Rates Master</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Tax Rate</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Tax Rate</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GST">GST</SelectItem>
                                        <SelectItem value="TDS">TDS</SelectItem>
                                        <SelectItem value="TCS">TCS</SelectItem>
                                        <SelectItem value="VAT">VAT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Name (e.g. GST 18%, TDS 194C)</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Rate %</Label>
                                <Input type="number" value={formData.rate} onChange={(e) => handleRateChange(parseFloat(e.target.value))} />
                            </div>
                            {formData.type === "GST" && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">CGST %</Label>
                                        <Input type="number" value={formData.cgst} disabled />
                                    </div>
                                    <div>
                                        <Label className="text-xs">SGST %</Label>
                                        <Input type="number" value={formData.sgst} disabled />
                                    </div>
                                    <div>
                                        <Label className="text-xs">IGST %</Label>
                                        <Input type="number" value={formData.igst} disabled />
                                    </div>
                                </div>
                            )}
                            <Button onClick={handleSubmit}>Save</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configured Rates</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Rate %</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialRates.map((tax) => (
                                <TableRow key={tax.id}>
                                    <TableCell className="font-medium">{tax.name}</TableCell>
                                    <TableCell>{tax.type}</TableCell>
                                    <TableCell>{tax.rate}%</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {tax.type === "GST" ? `C:${tax.cgst}% S:${tax.sgst}% I:${tax.igst}%` : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tax.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
