"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, Trash2, Calendar, FileText, IndianRupee } from "lucide-react"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ExpenseForm } from "@/components/forms/expense-form"
import { useRouter } from "next/navigation"
import { deleteExpense } from "@/lib/actions"
import { toast } from "sonner"

interface Expense {
    id: string
    title: string
    amount: number
    date: Date | string
    category: string
    vendor?: { name: string } | null
    description?: string | null
}

interface ExpenseManagementProps {
    initialExpenses: Expense[]
    vendors: { id: string, name: string }[]
    currentUserId: string
    projects: { id: string, name: string }[]
}

export function ExpenseManagement({ initialExpenses, vendors, currentUserId, projects }: ExpenseManagementProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()

    const filteredExpenses = initialExpenses.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            const res = await deleteExpense(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Expense deleted")
                router.refresh()
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Expense Tracker</h2>
                    <p className="text-sm text-muted-foreground">Monitor company spending and operational costs.</p>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={() => setOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Record Expense
                    </Button>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Record Expense</SheetTitle>
                            <SheetDescription>
                                Add a new expense record.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8">
                            <ExpenseForm
                                vendors={vendors}
                                userId={currentUserId}
                                projects={projects}
                                onSuccess={() => {
                                    setOpen(false)
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
                        placeholder="Search expenses..."
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
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No expenses recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(expense.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{expense.title}</span>
                                        {expense.description && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{expense.description}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                        {expense.category}
                                    </span>
                                </TableCell>
                                <TableCell>{expense.vendor?.name || "-"}</TableCell>
                                <TableCell className="text-right font-bold text-slate-700">
                                    ₹{expense.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(expense.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
