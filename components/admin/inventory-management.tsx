"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Search, MoreHorizontal, Package, Trash2, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteInventoryItem } from "@/lib/actions"
import { InventoryForm } from "@/components/forms/inventory-form"

// ... imports

interface InventoryItem {
    id: string
    name: string
    category: string | null
    currentStock: number
    unit: string | null
    minLevel: number | null
    location?: string | null
}

interface InventoryManagementProps {
    initialItems: InventoryItem[]
}

export function InventoryManagement({ initialItems }: InventoryManagementProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    // ... rest use filter logic


    const filtered = initialItems.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const res = await deleteInventoryItem(id)
        if (res.success) {
            toast.success("Item deleted")
            router.refresh()
        } else {
            toast.error("Failed to delete")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search materials..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={() => setOpen(true)} className="bg-slate-800 hover:bg-slate-900 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Material
                    </Button>
                    <SheetContent className="sm:max-w-xl">
                        <SheetHeader>
                            <SheetTitle>Add Material</SheetTitle>
                            <SheetDescription>Track construction materials and stock levels.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            <InventoryForm onSuccess={() => {
                                setOpen(false)
                                router.refresh()
                            }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock Level</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No inventory found. Add materials to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{item.currentStock}</span> {item.unit}
                                        {item.currentStock < (item.minLevel || 0) && (
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{item.location || '-'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border
                                        ${item.currentStock > (item.minLevel || 0) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                                     `}>
                                        {item.currentStock > (item.minLevel || 0) ? 'In Stock' : 'Low Stock'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
