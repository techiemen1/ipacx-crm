"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyProfileSchema, type CompanyProfileFormValues } from "@/lib/schemas"
import { createCompany, updateCompany, deleteCompany } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Plus, Trash, Pencil, Building, Globe } from "lucide-react"

interface CompanySettingsProps {
    initialCompanies: any[]
}

export function CompanySettings({ initialCompanies }: CompanySettingsProps) {
    const [companies, setCompanies] = useState(initialCompanies)
    const [open, setOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<any>(null)

    const form = useForm<CompanyProfileFormValues>({
        resolver: zodResolver(companyProfileSchema),
        defaultValues: {
            name: "",
            address: "",
            country: "India",
            currency: "INR",
            timezone: "Asia/Kolkata",
            gstin: "",
            pan: "",
            email: "",
            phone: "",
            website: "",
            isDefault: false
        }
    })

    const handleEdit = (company: any) => {
        setEditingCompany(company)
        form.reset({
            name: company.name,
            address: company.address || "",
            country: company.country || "India",
            currency: company.currency || "INR",
            timezone: company.timezone || "Asia/Kolkata",
            gstin: company.gstin || "",
            pan: company.pan || "",
            email: company.email || "",
            phone: company.phone || "",
            website: company.website || "",
            isDefault: company.isDefault
        })
        setOpen(true)
    }

    const handleCreate = () => {
        setEditingCompany(null)
        form.reset({
            name: "",
            country: "India",
            currency: "INR",
            timezone: "Asia/Kolkata",
            isDefault: companies.length === 0 // Make first one default automatically
        })
        setOpen(true)
    }

    async function onSubmit(data: CompanyProfileFormValues) {
        if (editingCompany) {
            const res = await updateCompany(editingCompany.id, data)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Company updated")
                setCompanies(companies.map(c => c.id === editingCompany.id ? res.data : c))
                setOpen(false)
            }
        } else {
            const res = await createCompany(data)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Company created")
                setCompanies([...companies, res.data])
                setOpen(false)
            }
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return
        const res = await deleteCompany(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Company deleted")
            setCompanies(companies.filter(c => c.id !== id))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Organization Profile</h3>
                    <p className="text-sm text-slate-500">Manage your company details, address, and branding.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Entity
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name *</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="gstin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GSTIN</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PAN</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
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
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Timezone</FormLabel>
                                                <FormControl><Input {...field} placeholder="Asia/Kolkata" /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isDefault"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Default Entity</FormLabel>
                                            </div>
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end pt-4">
                                    <Button type="submit">Save Details</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Tax ID</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Currency/Zone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No company profiles added yet. Add one to start.
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="p-2 bg-slate-100 rounded-md"><Building className="h-4 w-4 text-slate-500" /></span>
                                            <div>
                                                {company.name}
                                                {company.isDefault && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p><span className="text-slate-500 text-xs">GST:</span> {company.gstin || "-"}</p>
                                            <p><span className="text-slate-500 text-xs">PAN:</span> {company.pan || "-"}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600 max-w-[200px] truncate">
                                            {company.address}, {company.country}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <Globe className="h-3 w-3" /> {company.currency} / {company.timezone}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                                                <Pencil className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)}>
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
