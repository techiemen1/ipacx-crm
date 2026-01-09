"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createBankAccount } from "@/lib/banking-actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Landmark, Plus, ArrowRightLeft, ScrollText } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    ifsc: z.string().default(""),
    bankName: z.string().default(""),
    branch: z.string().default(""),
    currency: z.string().default("INR"),
})

interface BankDashboardProps {
    initialAccounts: any[]
}

export function BankDashboard({ initialAccounts }: BankDashboardProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            accountNumber: "",
            ifsc: "",
            bankName: "",
            branch: "",
            currency: "INR"
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createBankAccount(values)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Bank Account created")
            setOpen(false)
            form.reset()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Banking & Cash Flow</h2>
                    <p className="text-muted-foreground">Manage accounts, cheques and reconciliation.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Bank Account</DialogTitle>
                            <DialogDescription>
                                Add a new bank account to track transactions and balances.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Label</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. HDFC Main" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1234..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ifsc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IFSC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HDFC000..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HDFC Bank" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="branch"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Branch</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Mumbai" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {initialAccounts.map((account) => (
                    <Card key={account.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {account.name}
                            </CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{(account.currentBalance || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {account.bankName} - {account.accountNumber}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                    <Link href={`/admin/accounts/banking/reconcile/${account.id}`}>
                                        <ArrowRightLeft className="mr-1 h-3 w-3" /> Reconcile
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                    <Link href={`/admin/accounts/banking/cheques?accountId=${account.id}`}>
                                        <ScrollText className="mr-1 h-3 w-3" /> Cheques
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {initialAccounts.length === 0 && (
                    <div className="col-span-full text-center py-10 border-2 border-dashed rounded-lg bg-slate-50">
                        <p className="text-muted-foreground">No bank accounts added yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
