"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Mail, DollarSign, Calendar } from "lucide-react"
import { toast } from "sonner"
import { deleteDeals } from "@/lib/crm-actions"
import { ContactActions } from "@/components/admin/contact-actions"

interface CRMListProps {
    deals: any[]
}

export function CRMList({ deals }: CRMListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(deals.map(d => d.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds)
        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedIds(newSelected)
    }

    const handleDeleteSelected = async () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.size} deals?`)) {
            const res = await deleteDeals(Array.from(selectedIds))
            if (res.success) {
                toast.success("Deals deleted successfully")
                setSelectedIds(new Set())
            } else {
                toast.error("Failed to delete deals")
            }
        }
    }

    const handleBulkEmail = () => {
        const emails = deals
            .filter(d => selectedIds.has(d.id) && d.customer?.email)
            .map(d => d.customer.email)
            .join(",")
        if (!emails) return toast.error("No valid emails in selection")
        window.open(`mailto:?bcc=${emails}`, '_blank')
    }

    return (
        <div className="space-y-4">
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                    <span className="text-sm px-2 font-medium">{selectedIds.size} selected</span>
                    <Button variant="ghost" size="sm" onClick={handleBulkEmail}>
                        <Mail className="h-4 w-4 mr-2" /> Email
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteSelected}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                </div>
            )}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectedIds.size === deals.length && deals.length > 0}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                />
                            </TableHead>
                            <TableHead>Deal Title</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Expected Close</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deals.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No deals found.
                                </TableCell>
                            </TableRow>
                        )}
                        {deals.map((deal) => (
                            <TableRow key={deal.id} data-state={selectedIds.has(deal.id) && "selected"}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(deal.id)}
                                        onCheckedChange={(checked) => handleSelectRow(deal.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{deal.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                                        {deal.value.toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" style={{ backgroundColor: deal.stage?.color + '20', color: deal.stage?.color }}>
                                        {deal.stage?.name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {deal.customer && (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{deal.customer.firstName || deal.customer.name}</span>
                                            <ContactActions phone={deal.customer.phone} email={deal.customer.email} className="mt-1" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {deal.expectedCloseDate && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {/* Actions menu if needed, relying on bulk for now */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
