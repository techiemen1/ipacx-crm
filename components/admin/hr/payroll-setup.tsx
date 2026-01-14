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
import { Trash2 } from "lucide-react"

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
    const [shiftData, setShiftData] = useState({ name: "", startTime: "09:00", endTime: "18:00" })
    const createShiftAction = async () => {
        if (!shiftData.name || !shiftData.startTime || !shiftData.endTime) {
            return toast.error("All fields required")
        }
        const m = await import("@/lib/hr-actions")
        const res = await m.createShift(shiftData)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Shift Created")
            setShiftData({ name: "", startTime: "09:00", endTime: "18:00" })
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
                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-2 text-sm text-foreground">Departments ({departments.length})</h4>
                                {departments.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No departments added.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {departments.map(d => (
                                            <li key={d.id} className="flex items-center justify-between text-sm bg-muted/40 p-2 rounded-md group">
                                                <span>{d.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={async () => {
                                                        const m = await import("@/lib/hr-actions")
                                                        const res = await m.deleteDepartment(d.id)
                                                        if (res.error) toast.error(res.error)
                                                        else {
                                                            toast.success("Department deleted")
                                                            router.refresh()
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-2 text-sm text-foreground">Designations ({designations.length})</h4>
                                {designations.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No designations added.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {designations.map(d => (
                                            <li key={d.id} className="flex items-center justify-between text-sm bg-muted/40 p-2 rounded-md group">
                                                <span>{d.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={async () => {
                                                        const m = await import("@/lib/hr-actions")
                                                        const res = await m.deleteDesignation(d.id)
                                                        if (res.error) toast.error(res.error)
                                                        else {
                                                            toast.success("Designation deleted")
                                                            router.refresh()
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Work Shifts</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Define work timings for employees.</p>
                        {/* Placeholder for more complex shift UI */}
                        <div className="grid gap-4 bg-muted p-4 rounded-md">
                            <div className="grid gap-2">
                                <Label>Shift Name</Label>
                                <Input
                                    placeholder="e.g. Morning Shift"
                                    value={shiftData.name}
                                    onChange={e => setShiftData({ ...shiftData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={shiftData.startTime}
                                        onChange={e => setShiftData({ ...shiftData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={shiftData.endTime}
                                        onChange={e => setShiftData({ ...shiftData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button size="sm" onClick={createShiftAction}>Create Shift</Button>
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
