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
import { Plus, Search, MoreHorizontal, Building2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteProperty } from "@/lib/actions"
// Note: We'll create PropertyForm next
import { PropertyForm } from "@/components/forms/property-form"

// ... imports

interface Property {
    id: string
    name: string
    type: string
    size: string
    price: number
    status: string
    project: { name: string }
}

interface PropertyManagementProps {
    initialProperties: Property[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects: any[]
}

export function PropertyManagement({ initialProperties, projects }: PropertyManagementProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    // ... rest use filter logic


    const filtered = initialProperties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const res = await deleteProperty(id)
        if (res.success) {
            toast.success("Property deleted")
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
                        placeholder="Search properties..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={() => setOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Unit
                    </Button>
                    <SheetContent className="sm:max-w-xl">
                        <SheetHeader>
                            <SheetTitle>Add New Unit</SheetTitle>
                            <SheetDescription>Add a flat, villa, or plot to inventory.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            <PropertyForm projects={projects} onSuccess={() => {
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
                            <TableHead>Unit Name</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No properties found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.project.name}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.size}</TableCell>
                                <TableCell>₹{item.price.toLocaleString('en-IN')}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border
                                        ${item.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${item.status === 'Sold' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        ${item.status === 'Reserved' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                     `}>
                                        {item.status}
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
