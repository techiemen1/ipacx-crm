"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createDeal } from "@/lib/crm-actions"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

const dealSchema = z.object({
    title: z.string().min(1, "Title is required"),
    value: z.coerce.number().min(0),
    customerId: z.string().min(1, "Customer is required"),
    stageId: z.string().min(1, "Stage is required"),
    expectedCloseDate: z.string().optional()
})

interface DealDialogProps {
    customers: any[]
    stages: any[] // All stages flattened or filtered
    trigger?: React.ReactNode
    defaultCustomerId?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DealDialog({ customers, stages, trigger, defaultCustomerId, open: controlledOpen, onOpenChange }: DealDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = (val: boolean) => {
        if (isControlled && onOpenChange) {
            onOpenChange(val)
        } else {
            setInternalOpen(val)
        }
    }

    const form = useForm<z.infer<typeof dealSchema>>({
        resolver: zodResolver(dealSchema) as any,
        defaultValues: {
            title: "",
            value: 0,
            customerId: defaultCustomerId || "",
            stageId: stages[0]?.id || "",
            expectedCloseDate: ""
        }
    })

    async function onSubmit(values: z.infer<typeof dealSchema>) {
        setLoading(true)
        const result = await createDeal({
            ...values,
            expectedCloseDate: values.expectedCloseDate ? new Date(values.expectedCloseDate) : undefined
        })
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Deal created")
            setOpen(false)
            form.reset()
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="mr-2 h-4 w-4" /> Add Deal</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Deal</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deal Title</FormLabel>
                                <FormControl><Input placeholder="e.g. Bulk Order for X" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="value" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="expectedCloseDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expected Close</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="customerId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="stageId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Initial Stage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Stage" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {stages.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Deal
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
