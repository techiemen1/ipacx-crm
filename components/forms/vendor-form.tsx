"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { vendorSchema, type VendorFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { createVendor, updateVendor } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface VendorFormProps {
    initialData?: {
        id: string
        name: string
        category: string
        email: string | null
        phone: string | null
        address: string | null
        gstin: string | null
    }
    onSuccess: () => void
}

export function VendorForm({ initialData, onSuccess }: VendorFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            name: initialData?.name || "",
            category: initialData?.category || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
            gstin: initialData?.gstin || "",
        },
    })

    async function onSubmit(data: VendorFormValues) {
        setLoading(true)
        try {
            if (initialData) {
                const res = await updateVendor(initialData.id, data)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success("Vendor updated successfully")
                    onSuccess()
                }
            } else {
                const res = await createVendor(data)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success("Vendor created successfully")
                    onSuccess()
                }
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vendor Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Ultratech Cement Ltd" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Supplier">Supplier (Materials)</SelectItem>
                                        <SelectItem value="Contractor">Contractor (Labor)</SelectItem>
                                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                                        <SelectItem value="Utility">Utility</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GSTIN</FormLabel>
                                <FormControl>
                                    <Input placeholder="GST Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="vendor@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+91..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Billing Address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Vendor" : "Create Vendor"}
                </Button>
            </form>
        </Form>
    )
}
