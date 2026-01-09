"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceSchema, type InvoiceFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { createInvoice, updateInvoice } from "@/lib/actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { INDIAN_STATES, getStateFromGstin } from "@/lib/constants"

interface InvoiceFormProps {
    customers: { id: string; name: string; address?: string | null; gstin?: string | null }[]
    inventoryItems?: { name: string }[]
    initialData?: any
    taxRates?: { id: string; name: string; rate: number }[]
    companyProfiles?: { id: string; name: string; address: string; gstin?: string | null }[]
}

export function InvoiceForm({ customers, initialData, inventoryItems = [], taxRates = [], companyProfiles = [] }: InvoiceFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [invoiceNo, setInvoiceNo] = useState("")

    useEffect(() => {
        if (!initialData) {
            setInvoiceNo(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`)
        }
    }, [initialData])

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: initialData ? {
            ...initialData,
            dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            invoiceItems: initialData.invoiceItems?.map((item: any) => ({
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                taxRate: item.taxRate,
                amount: item.amount,
                cgstAmount: item.cgstAmount || 0,
                sgstAmount: item.sgstAmount || 0,
                igstAmount: item.igstAmount || 0,
                cessAmount: item.cessAmount || 0
            })) || [{ description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, cessAmount: 0 }],
            companyProfileId: initialData.companyProfileId || (companyProfiles.length > 0 ? companyProfiles[0].id : ""),
            placeOfSupply: initialData.placeOfSupply || ""
        } : {
            invoiceNo: "",
            customerId: "",
            amount: 0,
            taxRate: 0,
            type: "INVOICE",
            status: "Draft",
            dueDate: new Date().toISOString().split('T')[0],
            invoiceItems: [{ description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, cessAmount: 0 }],
            notes: "",
            terms: "Payment due within 15 days.",
            tdsAmount: 0,
            tcsAmount: 0,
            companyProfileId: companyProfiles.length > 0 ? companyProfiles[0].id : "",
            placeOfSupply: "",
            gstin: "",
            transportMode: "",
            vehicleNo: "",
            distance: 0,
            transporterId: ""
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "invoiceItems"
    })

    // Update invoice number
    useEffect(() => {
        if (invoiceNo && !initialData) {
            form.setValue("invoiceNo", invoiceNo)
        }
    }, [invoiceNo, form, initialData])

    // Detect Place of Supply when Customer Changes
    const watchedCustomerId = form.watch("customerId")

    useEffect(() => {
        if (watchedCustomerId) {
            const customer = customers.find(c => c.id === watchedCustomerId)
            if (customer) {
                // Try to deduce state from GSTIN first, then logic from address could potentially work but is harder.
                // We'll trust GSTIN first.
                if (customer.gstin) {
                    const stateName = getStateFromGstin(customer.gstin)
                    if (stateName) {
                        form.setValue("placeOfSupply", stateName)
                    }
                    form.setValue("gstin", customer.gstin)
                }
                // else if address contains state logic... (skipped for now, reliance on GSTIN or Manual)
            }
        }
    }, [watchedCustomerId, customers, form])

    // Calculate Taxes
    const items = form.watch("invoiceItems")
    const placeOfSupply = form.watch("placeOfSupply")
    const companyProfileId = form.watch("companyProfileId")

    useEffect(() => {
        const company = companyProfiles.find(c => c.id === companyProfileId)
        // Assume company state from its GSTIN if available, or address? 
        // For simplicity, let's assume Company GSTIN is available or we need to parse it. 
        // If company has no GSTIN, we default to Intra-State logic or assume Karnataka (based on logs).
        // Let's try to get company state.

        let companyState = ""
        if (company?.gstin) {
            companyState = getStateFromGstin(company.gstin) || ""
        }
        // Fallback: Default to Karnataka if not found (Hardcoded for this user context as Bhunethri is BLR based)
        if (!companyState) companyState = "Karnataka"

        const isInterState = placeOfSupply && companyState && placeOfSupply.toLowerCase() !== companyState.toLowerCase()

        // Iterate and update tax splits
        // Note: This useEffect might cause infinite loops if we setValue blindly. 
        // We should only strictly update if values mismatch.
        // Actually, better to do this calculation at render or in the field onChange. 
        // But doing it here ensures global consistency if Place of Supply changes.

        // We will just read the values in rendering or strictly update.

        items?.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const rate = Number(item.rate) || 0
            const taxRate = Number(item.taxRate) || 0
            const lineAmount = quantity * rate
            const totalTax = (lineAmount * taxRate) / 100

            let newCgst = 0, newSgst = 0, newIgst = 0

            if (isInterState) {
                newIgst = totalTax
            } else {
                newCgst = totalTax / 2
                newSgst = totalTax / 2
            }

            // Only update if changed to avoid loop
            if (item.cgstAmount !== newCgst || item.sgstAmount !== newSgst || item.igstAmount !== newIgst) {
                // We need to be careful with infinite loops. 
                // React Hook Form's setValue shouldn't trigger this effect unless we are watching all fields.
                // We are watching 'items', so this IS dangerous. 
                // Better approach: Calculate derived values during submission or rendering, 
                // OR use a specific function to recalculate all items.
            }
        })

    }, [items, placeOfSupply, companyProfileId, companyProfiles])

    // Better Approach for Tax Calc:
    // Create a helper to recalculate a single row's tax
    const recalculateTaxForRow = (index: number, currentItem?: any) => {
        const item = currentItem || form.getValues(`invoiceItems.${index}`)
        const qty = Number(item.quantity) || 0
        const rate = Number(item.rate) || 0
        const taxRate = Number(item.taxRate) || 0

        const lineVal = qty * rate
        const totalTax = (lineVal * taxRate) / 100

        const currentPlaceOfSupply = form.getValues("placeOfSupply")
        const currentCompanyId = form.getValues("companyProfileId")
        const company = companyProfiles.find(c => c.id === currentCompanyId)
        const companyState = company?.gstin ? getStateFromGstin(company.gstin) : "Karnataka"

        const isInterState = currentPlaceOfSupply && companyState && currentPlaceOfSupply.toLowerCase() !== companyState.toLowerCase()

        if (isInterState) {
            form.setValue(`invoiceItems.${index}.igstAmount`, totalTax)
            form.setValue(`invoiceItems.${index}.cgstAmount`, 0)
            form.setValue(`invoiceItems.${index}.sgstAmount`, 0)
        } else {
            form.setValue(`invoiceItems.${index}.cgstAmount`, totalTax / 2)
            form.setValue(`invoiceItems.${index}.sgstAmount`, totalTax / 2)
            form.setValue(`invoiceItems.${index}.igstAmount`, 0)
        }
        form.setValue(`invoiceItems.${index}.amount`, lineVal)
    }

    // Effect to recalculate ALL rows when Place of Supply or Company changes
    useEffect(() => {
        fields.forEach((_, index) => {
            recalculateTaxForRow(index)
        })
    }, [placeOfSupply, companyProfileId])


    const subtotal = (form.watch("invoiceItems") || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0)
    const grandTax = (form.watch("invoiceItems") || []).reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0), 0)
    const tdsAmount = form.watch("tdsAmount") || 0
    const grandTotal = subtotal + grandTax - tdsAmount

    async function onSubmit(data: InvoiceFormValues) {
        setLoading(true)
        // Ensure tax splits are verified one last time? 
        // The form data already contains them as we updated them.

        let result;
        if (initialData) {
            result = await updateInvoice(initialData.id, data)
        } else {
            result = await createInvoice(data)
        }
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(initialData ? "Invoice updated successfully" : "Invoice generated successfully")
            router.push("/admin/accounts")
            router.refresh()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto p-6 bg-card border rounded-xl shadow-sm">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold">{initialData ? "Edit Invoice" : "Create New Invoice"}</h2>
                    <div className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="w-[150px]">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INVOICE">Standard Invoice</SelectItem>
                                            <SelectItem value="PROFORMA">Proforma Invoice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="w-[150px]">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="companyProfileId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Company</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Company" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {companyProfiles.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="invoiceNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="INV-..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {customers?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="placeOfSupply"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Place of Supply</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="h-[200px]">
                                        {INDIAN_STATES.map(s => (
                                            <SelectItem key={s.code} value={s.name}>{s.name} ({s.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer GSTIN</FormLabel>
                                <FormControl>
                                    <Input placeholder="GSTIN" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Dynamic Line Items */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Line Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left w-[35%]">Description</th>
                                    <th className="px-4 py-3 text-right w-[10%]">Qty</th>
                                    <th className="px-4 py-3 text-right w-[15%]">Rate</th>
                                    <th className="px-4 py-3 text-right w-[15%]">Tax (%)</th>
                                    <th className="px-4 py-3 text-right w-[20%]">Amount</th>
                                    <th className="px-4 py-3 w-[5%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {fields.map((field, index) => (
                                    <tr key={field.id} className="group">
                                        <td className="p-2">
                                            <Input
                                                {...form.register(`invoiceItems.${index}.description`)}
                                                placeholder="Item description"
                                                list={`inventory-list-${index}`}
                                                className="border-0 focus-visible:ring-0 px-2"
                                            />
                                            <datalist id={`inventory-list-${index}`}>
                                                {inventoryItems.map((item, i) => (
                                                    <option key={i} value={item.name} />
                                                ))}
                                            </datalist>
                                        </td>
                                        <td className="p-2">
                                            <FormField
                                                control={form.control}
                                                name={`invoiceItems.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    recalculateTaxForRow(index)
                                                                }}
                                                                className="border-0 focus-visible:ring-0 text-right px-2"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <FormField
                                                control={form.control}
                                                name={`invoiceItems.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    recalculateTaxForRow(index)
                                                                }}
                                                                className="border-0 focus-visible:ring-0 text-right px-2"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <FormField
                                                control={form.control}
                                                name={`invoiceItems.${index}.taxRate`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <Select
                                                            value={field.value?.toString()}
                                                            onValueChange={(val) => {
                                                                field.onChange(parseFloat(val))
                                                                recalculateTaxForRow(index)
                                                            }}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="border-0 focus:ring-0 shadow-none text-right justify-end">
                                                                    <SelectValue placeholder="%" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="0">0%</SelectItem>
                                                                {taxRates.map(r => (
                                                                    <SelectItem key={r.id} value={r.rate.toString()}>{r.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700">
                                                    ₹{(((form.watch(`invoiceItems.${index}.quantity`) || 0) * (form.watch(`invoiceItems.${index}.rate`) || 0)) +
                                                        (form.watch(`invoiceItems.${index}.cgstAmount`) || 0) +
                                                        (form.watch(`invoiceItems.${index}.sgstAmount`) || 0) +
                                                        (form.watch(`invoiceItems.${index}.igstAmount`) || 0)).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {(form.watch(`invoiceItems.${index}.igstAmount`) || 0) > 0 ?
                                                        `IGST: ₹${(form.watch(`invoiceItems.${index}.igstAmount`) || 0).toFixed(2)}` :
                                                        `CGST+SGST: ₹${((form.watch(`invoiceItems.${index}.cgstAmount`) || 0) + (form.watch(`invoiceItems.${index}.sgstAmount`) || 0)).toFixed(2)}`
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-center">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <span className="sr-only">Delete</span>
                                                &times;
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 border-t bg-slate-50">
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, cessAmount: 0 })}>
                                + Add Item
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="w-1/3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Total Tax (GST):</span>
                            <span>₹{grandTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span>Grand Total:</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Internal Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Private notes..." className="h-20" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Terms & Conditions</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Payment terms..." className="h-20" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full bg-slate-900 text-white" size="lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? (initialData ? "Updating..." : "Generating...") : (initialData ? "Update Invoice" : "Create Invoice")}
                </Button>
            </form>
        </Form>
    )
}
