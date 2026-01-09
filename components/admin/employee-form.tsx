"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createEmployee } from "@/lib/hr-actions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),

    departmentId: z.string().optional(),
    designationId: z.string().optional(),
    shiftId: z.string().optional(),

    joinDate: z.string().min(1, "Join Date is required"),

    // Statutory
    pan: z.string().optional(),
    aadhar: z.string().optional(),
    uan: z.string().optional(),
    pfNumber: z.string().optional(),
    esiNumber: z.string().optional(),

    // Bank
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
})

interface EmployeeFormProps {
    departments: any[]
    designations: any[]
    shifts: any[]
}

export function EmployeeForm({ departments, designations, shifts }: EmployeeFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "", lastName: "", email: "", phone: "",
            departmentId: "", designationId: "", shiftId: "",
            joinDate: new Date().toISOString().split('T')[0],
            pan: "", aadhar: "", uan: "", pfNumber: "", esiNumber: "",
            bankName: "", accountNumber: "", ifsc: ""
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createEmployee({
            ...values,
            joinDate: new Date(values.joinDate)
        })
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Employee onboarding complete")
            router.push("/admin/hr/employees")
            router.refresh()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="joinDate" render={({ field }) => (
                            <FormItem><FormLabel>Join Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">Organization</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="departmentId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger></FormControl>
                                    <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="designationId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Designation" /></SelectTrigger></FormControl>
                                    <SelectContent>{designations.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="shiftId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shift</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Shift" /></SelectTrigger></FormControl>
                                    <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">Statutory & Compliance</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="pan" render={({ field }) => (
                            <FormItem><FormLabel>PAN Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aadhar" render={({ field }) => (
                            <FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="uan" render={({ field }) => (
                            <FormItem><FormLabel>UAN (PF)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pfNumber" render={({ field }) => (
                            <FormItem><FormLabel>PF Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="esiNumber" render={({ field }) => (
                            <FormItem><FormLabel>ESI Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">Bank Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="bankName" render={({ field }) => (
                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                            <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="ifsc" render={({ field }) => (
                            <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Onboarding
                </Button>
            </form>
        </Form>
    )
}
