"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { inventoryItemSchema, InventoryItemFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { createInventoryItem } from "@/lib/inventory-actions"
import { toast } from "sonner"
import { useState } from "react"

interface InventoryFormProps {
    onSuccess?: () => void
}

export function InventoryForm({ onSuccess }: InventoryFormProps) {
    const [loading, setLoading] = useState(false)
    const form = useForm<InventoryItemFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(inventoryItemSchema) as any,
        defaultValues: {
            name: "",
            category: "",
            unit: "",
            minLevel: 10
        }
    })

    async function onSubmit(data: InventoryItemFormValues) {
        setLoading(true)
        const result = await createInventoryItem(data)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Material added to inventory")
            form.reset()
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Material Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Ultratech Cement" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Raw Material, Electrical" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                    <Input placeholder="bags, kg, m" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="minLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Level</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>



                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white" disabled={loading}>
                    {loading ? "Adding..." : "Add Material"}
                </Button>
            </form>
        </Form>
    )
}
