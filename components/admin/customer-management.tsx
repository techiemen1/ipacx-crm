"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { CustomerForm } from "@/components/forms/customer-form"
import { useRouter } from "next/navigation"
import { DealDialog } from "@/components/admin/crm/deal-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContactActions } from "@/components/admin/contact-actions"

interface Customer {
    id: string
    name: string
    email: string
    phone: string
    status: string
    projectInterest?: string | null
    address?: string | null
    gstin?: string | null
    pan?: string | null
}

interface CustomerManagementProps {
    initialCustomers: Customer[]
    stages?: any[]
}

import { deleteCustomers } from "@/lib/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Trash2, Mail } from "lucide-react"

// ... imports

export function CustomerManagement({ initialCustomers, stages = [] }: CustomerManagementProps) {
    const [open, setOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [dealDialogOpen, setDealDialogOpen] = useState(false)
    const [dealCustomer, setDealCustomer] = useState<Customer | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const router = useRouter()

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(initialCustomers.map(c => c.id)))
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
        if (confirm(`Are you sure you want to delete ${selectedIds.size} customers?`)) {
            const res = await deleteCustomers(Array.from(selectedIds))
            if (res.success) {
                toast.success("Customers deleted successfully")
                setSelectedIds(new Set())
            } else {
                toast.error(res.error || "Failed to delete customers")
            }
        }
    }

    const handleBulkEmail = () => {
        const emails = initialCustomers
            .filter(c => selectedIds.has(c.id) && c.email)
            .map(c => c.email)
            .join(",")
        if (!emails) return toast.error("No valid emails in selection")
        window.open(`mailto:?bcc=${emails}`, '_blank')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Leads & Customers</h2>
                    <p className="text-sm text-muted-foreground">Manage your client database.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-4 bg-muted/50 p-1 rounded-lg">
                            <span className="text-sm px-2 font-medium">{selectedIds.size} selected</span>
                            <Button variant="ghost" size="sm" onClick={handleBulkEmail}>
                                <Mail className="h-4 w-4 mr-2" /> Email
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteSelected}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </div>
                    )}
                    <Sheet open={open} onOpenChange={(val) => {
                        setOpen(val)
                        if (!val) setSelectedCustomer(null)
                    }}>
                        <Button onClick={() => { setSelectedCustomer(null); setOpen(true) }} className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add Lead
                        </Button>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{selectedCustomer ? "Edit Client" : "Add New Lead"}</SheetTitle>
                                <SheetDescription>
                                    {selectedCustomer ? "Update client details." : "Add a new potential client to the system."}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-8">
                                <CustomerForm
                                    initialData={selectedCustomer ? {
                                        ...selectedCustomer,
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        status: selectedCustomer.status as any,
                                        projectInterest: selectedCustomer.projectInterest || undefined,
                                        address: selectedCustomer.address || undefined,
                                        gstin: selectedCustomer.gstin || undefined,
                                        pan: selectedCustomer.pan || undefined
                                    } : undefined}
                                    onSuccess={() => {
                                        setOpen(false)
                                        setSelectedCustomer(null)
                                        router.refresh()
                                    }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Deal Dialog */}


            {/* Let's use the DropdownMenu properly */}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectedIds.size === initialCustomers.length && initialCustomers.length > 0}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                />
                            </TableHead>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Connect</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Interest</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCustomers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No customers found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {initialCustomers.map((customer) => (
                            <TableRow key={customer.id} data-state={selectedIds.has(customer.id) && "selected"}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(customer.id)}
                                        onCheckedChange={(checked) => handleSelectRow(customer.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{customer.email}</div>
                                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                </TableCell>
                                <TableCell>
                                    <ContactActions phone={customer.phone} email={customer.email} />
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                                        ${customer.status === 'Customer' ? 'bg-green-50 text-green-700 border-green-200' :
                                            customer.status === 'Prospect' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                        {customer.status}
                                    </span>
                                </TableCell>
                                <TableCell>{customer.projectInterest || "-"}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedCustomer(customer)
                                                setOpen(true)
                                            }}>
                                                Edit Client
                                            </DropdownMenuItem>
                                            {stages && stages.length > 0 && (
                                                <DropdownMenuItem onClick={() => {
                                                    setDealCustomer(customer)
                                                }}>
                                                    Transfer to CRM
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {dealCustomer && (
                <DealDialog
                    key={dealCustomer.id}
                    customers={initialCustomers}
                    stages={stages || []}
                    defaultCustomerId={dealCustomer.id}
                    open={dealCustomer !== null}
                    onOpenChange={(val) => {
                        if (!val) setDealCustomer(null)
                    }}
                />
            )}
        </div>
    )
}
