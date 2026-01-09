"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, Tag, Box, Layers, Pencil, Trash2 } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { createInventoryGroup, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateInventoryGroup, deleteInventoryGroup } from "@/lib/inventory-actions"
import { useRouter } from "next/navigation"

interface InventoryItemsProps {
    items: any[]
    groups: any[]
}

export default function InventoryItemsManagement({ items, groups }: InventoryItemsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("items") // items | groups
    const router = useRouter()

    // Forms
    const [newItem, setNewItem] = useState<{
        id?: string, name: string, sku: string, barcode?: string, category: string, groupId: string, unit: string, minLevel: number,
        isBatchTracked?: boolean, isSerialTracked?: boolean
    }>({
        name: "", sku: "", barcode: "", category: "", groupId: "", unit: "", minLevel: 10, isBatchTracked: false, isSerialTracked: false
    })
    const [newGroup, setNewGroup] = useState<{ id?: string, name: string, description: string }>({ name: "", description: "" })

    // Dialogs
    const [itemOpen, setItemOpen] = useState(false)
    const [groupOpen, setGroupOpen] = useState(false)
    const [groupListOpen, setGroupListOpen] = useState(false)

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateGroup = async () => {
        if (!newGroup.name) return toast.error("Group name required")

        let res;
        if (newGroup.id) {
            res = await updateInventoryGroup(newGroup.id, newGroup)
        } else {
            res = await createInventoryGroup(newGroup)
        }

        if (res.error) toast.error(res.error)
        else {
            toast.success(newGroup.id ? "Group updated" : "Group created")
            setGroupOpen(false)
            setNewGroup({ name: "", description: "" })
            router.refresh()
        }
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return
        const res = await deleteInventoryGroup(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Group deleted")
            router.refresh()
        }
    }

    const handleCreateItem = async () => {
        if (!newItem.name) return toast.error("Item name required")

        let res;
        if (newItem.id) {
            res = await updateInventoryItem(newItem.id, newItem)
        } else {
            res = await createInventoryItem(newItem)
        }

        if (res.error) toast.error(res.error)
        else {
            toast.success(newItem.id ? "Item updated" : "Item created")
            setItemOpen(false)
            setNewItem({ name: "", sku: "", barcode: "", category: "", groupId: "", unit: "", minLevel: 10 })
            router.refresh()
        }
    }

    const handleEditItem = (item: any) => {
        setNewItem({
            id: item.id,
            name: item.name,
            sku: item.sku || "",
            barcode: item.barcode || "",
            category: item.category,
            groupId: item.groupId || "",
            unit: item.unit,
            minLevel: item.minLevel,
            isBatchTracked: item.isBatchTracked,
            isSerialTracked: item.isSerialTracked
        })
        setItemOpen(true)
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const res = await deleteInventoryItem(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Item deleted")
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Items</h1>
                    <p className="text-muted-foreground">Manage products, raw materials, and groups.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={groupListOpen} onOpenChange={setGroupListOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Layers className="mr-2 h-4 w-4" /> Manage Groups
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Inventory Groups</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={() => { setGroupOpen(true); setNewGroup({ name: "", description: "" }) }}>+ New Group</Button>
                                </div>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Items</TableHead>
                                                <TableHead className="w-[100px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groups.map(g => (
                                                <TableRow key={g.id}>
                                                    <TableCell className="font-medium">{g.name}</TableCell>
                                                    <TableCell>{g.description}</TableCell>
                                                    <TableCell className="text-right">{g._count?.items || 0}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => {
                                                                setNewGroup({ id: g.id, name: g.name, description: g.description || "" })
                                                                setGroupOpen(true)
                                                            }}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteGroup(g.id)}>
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
                        </DialogContent>
                    </Dialog>

                    <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{newGroup.id ? "Edit Group" : "Create Inventory Group"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
                                </div>
                                <Button onClick={handleCreateGroup}>Save Group</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={itemOpen} onOpenChange={setItemOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setNewItem({ name: "", sku: "", barcode: "", category: "", groupId: "", unit: "", minLevel: 10 })}>
                                <Plus className="mr-2 h-4 w-4" /> New Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{newItem.id ? "Edit Item" : "Create Inventory Item"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Item Name</Label>
                                        <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>SKU / Code</Label>
                                        <Input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Barcode</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newItem.barcode || ""}
                                            onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                                            placeholder="Scan or Type"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNewItem({ ...newItem, barcode: Math.random().toString(36).substring(2, 10).toUpperCase() })}
                                            title="Generate Random"
                                        >
                                            <Tag className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder="General Category" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Group</Label>
                                        <Select value={newItem.groupId} onValueChange={(v) => setNewItem({ ...newItem, groupId: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map(g => (
                                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Unit</Label>
                                        <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nos">Nos</SelectItem>
                                                <SelectItem value="Kg">Kg</SelectItem>
                                                <SelectItem value="Mtr">Mtr</SelectItem>
                                                <SelectItem value="Ltr">Ltr</SelectItem>
                                                <SelectItem value="Box">Box</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Min. Stock Level</Label>
                                        <Input type="number" value={newItem.minLevel} onChange={(e) => setNewItem({ ...newItem, minLevel: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="batchTracked"
                                            checked={newItem.isBatchTracked}
                                            onChange={(e) => setNewItem({ ...newItem, isBatchTracked: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="batchTracked">Enable Batch Tracking</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="serialTracked"
                                            checked={newItem.isSerialTracked}
                                            onChange={(e) => setNewItem({ ...newItem, isSerialTracked: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="serialTracked">Enable Serial Numbers</Label>
                                    </div>
                                </div>
                                <Button onClick={handleCreateItem}>Save Item</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono text-xs">{item.sku || "-"}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    {item.group ? (
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {item.group.name}
                                        </span>
                                    ) : "-"}
                                </TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.currentStock}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteItem(item.id)}>
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
