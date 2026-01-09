"use client"

import { useState } from "react"
import { createChequeBook } from "@/lib/banking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Printer } from "lucide-react"

interface ChequeManagementProps {
    accounts: any[]
}

export function ChequeManagement({ accounts }: ChequeManagementProps) {
    const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.id || "")
    // In a real app we'd fetch books via server action or passed prop based on selection.
    // For simplicity, we'll assume we might need to reload/fetch data, but here page.tsx 
    // will just pass ALL books or we force a refresh.
    // Actually, let's just make this simpler: Use a wrapper component that fetches or use router refresh.
    // We will assume `initialBooks` are passed or we fetch them client side? 
    // Let's rely on searching/filtering client side if data is passed, or fetch if needed.
    // To properly support "Select Account -> Show Books", we should probably use URL state ?accountId=...

    // For this MVP, let's encourage using the URL query param driven by the page.

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cheque Management</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>+ New Cheque Book</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <ChequeBookForm accounts={accounts} defaultAccountId={selectedAccount} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Select Bank Account:</span>
                <Select value={selectedAccount} onValueChange={(val) => {
                    setSelectedAccount(val)
                    // Ideally redirect to ?accountId=val to fetch data server side
                    window.location.href = `/admin/accounts/banking/cheques?accountId=${val}`
                }}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name} - {acc.accountNumber}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* List of Cheque Books will be rendered by parent page or here if passed */}
        </div>
    )
}

function ChequeBookForm({ accounts, defaultAccountId }: { accounts: any[], defaultAccountId: string }) {
    const [loading, setLoading] = useState(false)
    const [accountId, setAccountId] = useState(defaultAccountId)
    const [startLeaf, setStartLeaf] = useState("")
    const [endLeaf, setEndLeaf] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const result = await createChequeBook({
            bankAccountId: accountId,
            startLeaf,
            endLeaf
        })
        setLoading(false)
        if (result.error) toast.error(result.error)
        else {
            toast.success("Cheque Book Created")
            window.location.reload()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
                <DialogTitle>Add Cheque Book</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
                <label className="text-sm font-medium">Bank Account</label>
                <Select value={accountId} onValueChange={setAccountId} disabled={!accounts.length}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Leaf (6 digits)</label>
                    <Input value={startLeaf} onChange={e => setStartLeaf(e.target.value)} maxLength={6} placeholder="000001" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Leaf (6 digits)</label>
                    <Input value={endLeaf} onChange={e => setEndLeaf(e.target.value)} maxLength={6} placeholder="000050" />
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
            </Button>
        </form>
    )
}

export function ChequeBookList({ books }: { books: any[] }) {
    if (books.length === 0) return <div className="text-center py-10 text-muted-foreground">No cheque books found for this account.</div>

    return (
        <div className="grid gap-6">
            {books.map(book => (
                <Card key={book.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between">
                            <CardTitle className="text-lg">Book #{book.startLeaf} - #{book.endLeaf}</CardTitle>
                            <Badge variant={book.status === "Active" ? "default" : "secondary"}>{book.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {book.leaves.map((leaf: any) => (
                                <div key={leaf.id} className={`
                                    p-2 rounded text-center text-xs border cursor-pointer hover:bg-slate-50
                                    ${leaf.status === 'Available' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                                    ${leaf.status === 'Issued' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                                    ${leaf.status === 'Used' ? 'bg-slate-100 border-slate-200 text-slate-500' : ''}
                                    ${leaf.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                                `}
                                    title={`${leaf.leafNumber} - ${leaf.status}`}
                                >
                                    {leaf.leafNumber}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
