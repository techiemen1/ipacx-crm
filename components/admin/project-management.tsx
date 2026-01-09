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
import { Plus, Search, MoreHorizontal, Briefcase, Trash2, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteProject } from "@/lib/actions"
import { ProjectForm } from "@/components/forms/project-form"

// ... imports

interface Project {
    id: string
    name: string
    location: string
    type: string
    status: string
    properties: { id: string }[]
}

interface ProjectManagementProps {
    initialProjects: Project[]
}

export function ProjectManagement({ initialProjects }: ProjectManagementProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    // ... rest use filter logic


    const filtered = initialProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? Deleting a project will delete all associated properties!")) return
        const res = await deleteProject(id)
        if (res.success) {
            toast.success("Project deleted")
            router.refresh()
        } else {
            toast.error("Failed to delete project")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={() => setOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white">
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                    <SheetContent className="sm:max-w-xl">
                        <SheetHeader>
                            <SheetTitle>New Project</SheetTitle>
                            <SheetDescription>Initialize a new real estate development project.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            <ProjectForm onSuccess={() => {
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
                            <TableHead>Project Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Units</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No projects found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {item.name}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {item.location}
                                    </div>
                                </TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border
                                        ${item.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                        ${item.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${item.status === 'Planning' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                     `}>
                                        {item.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {item.properties?.length || 0} Units
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
