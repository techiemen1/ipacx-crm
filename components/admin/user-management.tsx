"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, User, Trash2 } from "lucide-react"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserForm } from "@/components/forms/user-form"
import { deleteUser } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// ... imports
interface UserWithProfile {
    id: string
    name: string | null
    email: string | null
    role: string
    profile: {
        designation: string | null
        phone: string | null
    } | null
}

interface UserManagementProps {
    initialUsers: UserWithProfile[]
}

export function UserManagement({ initialUsers }: UserManagementProps) {
    const [open, setOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const res = await deleteUser(id)
        if (res.success) {
            toast.success("User deleted")
            router.refresh()
        } else {
            toast.error("Failed to delete")
        }
    }

    const mapUserToForm = (user: UserWithProfile) => {
        return {
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: user.role as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            designation: user.profile?.designation as any || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            phone: user.profile?.phone as any || ""
        }
    }

    /* 
    // Unused edit handler - kept for future reference if needed
    const handleEdit = (user: UserWithProfile) => {
        setSelectedUser(user)
        setOpen(true)
    } 
    */

    return (
        <div className="space-y-4">
            {/* ... render ... */}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Team Management</h2>
                    <p className="text-sm text-muted-foreground">Manage system access and roles.</p>
                </div>
                <Sheet open={open} onOpenChange={(val) => {
                    setOpen(val)
                    if (!val) setSelectedUser(null)
                }}>
                    <Button onClick={() => { setSelectedUser(null); setOpen(true) }} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{selectedUser ? "Edit User" : "Add New User"}</SheetTitle>
                            <SheetDescription>
                                {selectedUser ? "Update contact details and role." : "Create a new account for a staff member."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8">
                            <UserForm
                                initialData={selectedUser ? mapUserToForm(selectedUser) : undefined}
                                onSuccess={() => {
                                    setOpen(false)
                                    setSelectedUser(null)
                                    router.refresh()
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3 font-medium">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>{user.profile?.designation || "-"}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpen(true); }}>
                                                <User className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
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
