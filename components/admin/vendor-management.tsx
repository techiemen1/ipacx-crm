"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, Building2, Phone, Mail, MapPin, Trash2, Edit } from "lucide-react"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { VendorForm } from "@/components/forms/vendor-form"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { deleteVendor } from "@/lib/actions"
import { toast } from "sonner"

interface Vendor {
    id: string
    name: string
    category: string
    email: string | null
    phone: string | null
    address: string | null
    gstin: string | null
    status: string
}

interface VendorManagementProps {
    initialVendors: Vendor[]
}

export function VendorManagement({ initialVendors }: VendorManagementProps) {
    const [open, setOpen] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()

    const filteredVendors = initialVendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this vendor?")) {
            const res = await deleteVendor(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Vendor deleted")
                router.refresh()
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Vendor Management</h2>
                    <p className="text-sm text-muted-foreground">Manage suppliers, contractors, and service providers.</p>
                </div>
                <Sheet open={open} onOpenChange={(val) => {
                    setOpen(val)
                    if (!val) setSelectedVendor(null)
                }}>
                    <Button onClick={() => { setSelectedVendor(null); setOpen(true) }} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Vendor
                    </Button>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{selectedVendor ? "Edit Vendor" : "Add New Vendor"}</SheetTitle>
                            <SheetDescription>
                                {selectedVendor ? "Update vendor details." : "Register a new vendor for expenses and supplies."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8">
                            <VendorForm
                                initialData={selectedVendor || undefined}
                                onSuccess={() => {
                                    setOpen(false)
                                    setSelectedVendor(null)
                                    router.refresh()
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>GSTIN</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No vendors found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{vendor.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{vendor.category}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        {vendor.email && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Mail className="h-3 w-3" /> {vendor.email}
                                            </div>
                                        )}
                                        {vendor.phone && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Phone className="h-3 w-3" /> {vendor.phone}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{vendor.gstin || "-"}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${vendor.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {vendor.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600" onClick={() => {
                                            setSelectedVendor(vendor)
                                            setOpen(true)
                                        }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(vendor.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
