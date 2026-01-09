"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { recordPayment } from "@/lib/actions"
import { toast } from "sonner"

const paymentSchema = z.object({
    invoiceId: z.string(),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    method: z.string().min(1, "Payment method is required"),
    notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface RecordPaymentModalProps {
    invoice: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RecordPaymentModal({ invoice, open, onOpenChange, onSuccess }: RecordPaymentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calculate remaining amount
    const totalPaid = invoice?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
    const remainingAmount = (invoice?.totalAmount || 0) - totalPaid

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: {
            invoiceId: invoice?.id || "",
            amount: remainingAmount > 0 ? remainingAmount : 0,
            date: format(new Date(), "yyyy-MM-dd"),
            method: "Bank Transfer",
            notes: ""
        },
    })

    async function onSubmit(data: PaymentFormValues) {
        setIsSubmitting(true)
        try {
            const result = await recordPayment({
                ...data,
                invoiceId: invoice.id // Ensure ID comes from prop
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Payment recorded successfully")
                onOpenChange(false)
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!invoice) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for Invoice #{invoice.invoiceNo}.
                        <br />
                        Remaining Balance: <span className="font-semibold">₹{remainingAmount.toLocaleString()}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount Received (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference / Notes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Transaction ID, Cheque No, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
