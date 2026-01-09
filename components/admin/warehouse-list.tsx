"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Warehouse, MapPin, User, Trash2 } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { createWarehouse, deleteWarehouse, getWarehouses } from "@/lib/inventory-actions"
import { useRouter } from "next/navigation"

interface WarehousePageProps {
    initialWarehouses: any[]
}

export default function WarehousePage({ initialWarehouses = [] }: WarehousePageProps) { // Default to empty array
    const [warehouses, setWarehouses] = useState(initialWarehouses)
    const [open, setOpen] = useState(false)
    const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "", manager: "", capacity: "" })
    const router = useRouter()

    const handleCreate = async () => {
        if (!newWarehouse.name) return toast.error("Warehouse name is required")

        toast.info("Creating warehouse...")
        const res = await createWarehouse(newWarehouse)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Warehouse created")
            setOpen(false)
            setNewWarehouse({ name: "", location: "", manager: "", capacity: "" })
            router.refresh()
            // Optimistic update (optional, usually router.refresh handles it)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Delete this warehouse? Stocks will be deleted!")) {
            const res = await deleteWarehouse(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Warehouse deleted")
                router.refresh()
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                    <p className="text-muted-foreground">Manage storage locations and godowns.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newWarehouse.name}
                                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                                    placeholder="e.g. Central Godown"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newWarehouse.location}
                                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                                    placeholder="Address or City"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager">Manager</Label>
                                <Input
                                    id="manager"
                                    value={newWarehouse.manager}
                                    onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                                    placeholder="Manager Name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    value={newWarehouse.capacity}
                                    onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
                                    placeholder="e.g. 5000 sqft"
                                />
                            </div>
                            <Button onClick={handleCreate}>Create Warehouse</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {warehouses.map((wh: any) => (
                    <Card key={wh.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {wh.name}
                            </CardTitle>
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{wh.location || "No Location"}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" /> {wh.manager || "Unassigned"}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(wh.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
