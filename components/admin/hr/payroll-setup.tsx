"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createPayHead, createDepartment, createDesignation } from "@/lib/hr-actions"
import { useRouter } from "next/navigation"

interface PayrollSetupProps {
    payHeads: any[]
    departments: any[]
    designations: any[]
    shifts: any[]
}

export default function PayrollSetup({ payHeads, departments, designations, shifts }: PayrollSetupProps) {
    const router = useRouter()

    // Departments
    const [deptName, setDeptName] = useState("")
    const createDept = async () => {
        if (!deptName) return toast.error("Department name required")
        const res = await createDepartment(deptName)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Department created")
            setDeptName("")
            router.refresh()
        }
    }

    // Designations
    const [desigName, setDesigName] = useState("")
    const createDesig = async () => {
        if (!desigName) return toast.error("Designation name required")
        const res = await createDesignation(desigName)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Designation created")
            setDesigName("")
            router.refresh()
        }
    }

    // Shifts
    // Using simple state for shift creation - could be expanded to full dialog if needed
    // Default 9-6
    const createShiftAction = async () => {
        const res = await import("@/lib/hr-actions").then(m => m.createShift({ name: "General Shift", startTime: "09:00", endTime: "18:00" }))
        if (res.error) toast.error(res.error)
        else {
            toast.success("Default Shift Created")
            router.refresh()
        }
    }


    // Pay Heads
    const [phData, setPhData] = useState({ name: "", type: "EARNING", calculationType: "FLAT", isStatutory: false })
    const addPayHead = async () => {
        if (!phData.name) return toast.error("Pay Head Name required")
        const res = await createPayHead(phData)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Pay Head created")
            setPhData({ name: "", type: "EARNING", calculationType: "FLAT", isStatutory: false })
            router.refresh()
        }
    }

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Departments & Designations</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input placeholder="New Department Name" value={deptName} onChange={e => setDeptName(e.target.value)} />
                            <Button onClick={createDept}>Add</Button>
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="New Designation Name" value={desigName} onChange={e => setDesigName(e.target.value)} />
                            <Button onClick={createDesig}>Add</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <h4 className="font-semibold mb-2">Departments</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                    {departments.map(d => <li key={d.id}>{d.name}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Designations</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                    {designations.map(d => <li key={d.id}>{d.name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Work Shifts</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Define work timings for employees.</p>
                        {/* Placeholder for more complex shift UI */}
                        <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                            <span className="text-sm font-medium">General Shift (09:00 - 18:00)</span>
                            <Button size="sm" variant="outline" onClick={createShiftAction}>Create / Reset Default</Button>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Active Shifts</h4>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                {shifts.map(s => <li key={s.id}>{s.name} ({s.startTime} - {s.endTime})</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Pay Heads (Salary Components)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Pay Head Name</Label>
                        <Input value={phData.name} onChange={e => setPhData({ ...phData, name: e.target.value })} placeholder="e.g. Basic Salary, HRA" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Type</Label>
                            <Select value={phData.type} onValueChange={v => setPhData({ ...phData, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EARNING">Earning</SelectItem>
                                    <SelectItem value="DEDUCTION">Deduction</SelectItem>
                                    <SelectItem value="REIMBURSEMENT">Reimbursement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Calculation</Label>
                            <Select value={phData.calculationType} onValueChange={v => setPhData({ ...phData, calculationType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FLAT">Flat Amount</SelectItem>
                                    <SelectItem value="FORMULA">Formula Based</SelectItem>
                                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button className="w-full" onClick={addPayHead}>Create Pay Head</Button>

                    <div className="border rounded-md mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Calc</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payHeads.map(ph => (
                                    <TableRow key={ph.id}>
                                        <TableCell>{ph.name}</TableCell>
                                        <TableCell>{ph.type}</TableCell>
                                        <TableCell>{ph.calculationType}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
