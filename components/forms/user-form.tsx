"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema, UserFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { updateUser, createUser } from "@/lib/actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface UserFormProps {
    onSuccess?: () => void
    initialData?: UserFormValues & { id: string }
}

export function UserForm({ onSuccess, initialData }: UserFormProps) {
    const [loading, setLoading] = useState(false)
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "STAFF",
            designation: "",
            phone: "",
            ...initialData
        }
    })

    // Reset form when initialData changes (e.g. opening sheet for different user)
    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                password: "" // Don't prefill password
            })
        } else {
            form.reset({
                name: "", email: "", password: "", role: "STAFF", designation: "", phone: ""
            })
        }
    }, [initialData, form])

    async function onSubmit(data: UserFormValues) {
        setLoading(true)
        let result

        if (initialData) {
            result = await updateUser(initialData.id, data)
        } else {
            result = await createUser(data)
        }

        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(initialData ? "User updated" : "User created")
            if (!initialData) form.reset()
            onSuccess?.()
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
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{initialData ? "New Password" : "Password"}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder={initialData ? "Leave empty to keep" : "******"} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="ARCHITECT">Architect</SelectItem>
                                        <SelectItem value="SALES">Sales</SelectItem>
                                        <SelectItem value="STAFF">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : (initialData ? "Update User" : "Create User")}
                </Button>
            </form>
        </Form>
    )
}
