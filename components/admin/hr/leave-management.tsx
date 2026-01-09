"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createLeaveType, createLeaveRequest, updateLeaveRequestStatus } from "@/lib/hr-actions" // Need to add these
import { useRouter } from "next/navigation"

interface LeaveManagementProps {
    leaveTypes: any[]
    leaveRequests: any[]
    employees: any[]
}

export default function LeaveManagement({ leaveTypes, leaveRequests, employees }: LeaveManagementProps) {
    const router = useRouter()
    const [openType, setOpenType] = useState(false)
    const [openRequest, setOpenRequest] = useState(false)

    // Leave Type Form
    const [ltData, setLtData] = useState({ name: "", daysAllowed: 0, carryForwardMax: 0 })
    const submitLeaveType = async () => {
        if (!ltData.name) return toast.error("Name required")
        // const res = await createLeaveType(ltData) // TODO: Implement
        // if (res.error) toast.error(res.error)
        // else {
        //     toast.success("Leave Type Created")
        //     setOpenType(false)
        //     router.refresh()
        // }
        toast.info("Feature coming next step")
    }

    // Leave Request Status Update
    const updateStatus = async (id: string, status: string) => {
        // const res = await updateLeaveRequestStatus(id, status)
        // if (res.error) toast.error(res.error)
        // else {
        //     toast.success("Status Updated")
        //     router.refresh()
        // }
    }

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Leave Policies</CardTitle>
                        <Dialog open={openType} onOpenChange={setOpenType}>
                            <DialogTrigger asChild><Button size="sm" variant="outline">+ New Policy</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Leave Policy</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Leave Name (e.g. SL, CL)</Label>
                                        <Input value={ltData.name} onChange={e => setLtData({ ...ltData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Days/Year</Label>
                                            <Input type="number" value={ltData.daysAllowed} onChange={e => setLtData({ ...ltData, daysAllowed: +e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Carry Max</Label>
                                            <Input type="number" value={ltData.carryForwardMax} onChange={e => setLtData({ ...ltData, carryForwardMax: +e.target.value })} />
                                        </div>
                                    </div>
                                    <Button onClick={submitLeaveType} className="w-full">Create Policy</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {leaveTypes.map(lt => (
                                <div key={lt.id} className="flex justify-between items-center text-sm border p-2 rounded">
                                    <span className="font-medium">{lt.name}</span>
                                    <span className="text-muted-foreground">{lt.daysAllowed} days/yr</span>
                                </div>
                            ))}
                            {leaveTypes.length === 0 && <p className="text-muted-foreground text-xs">No policies defined.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {leaveRequests.filter((r: any) => r.status === 'PENDING').map((req: any) => (
                                <div key={req.id} className="border p-3 rounded text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{req.employee.firstName}</span>
                                        <Badge variant="outline">{req.leaveType.name}</Badge>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="destructive" onClick={() => updateStatus(req.id, "REJECTED")}>Reject</Button>
                                        <Button size="sm" onClick={() => updateStatus(req.id, "APPROVED")}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                            {leaveRequests.filter((r: any) => r.status === 'PENDING').length === 0 && (
                                <p className="text-muted-foreground text-xs">No pending requests.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequests.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.employee.firstName} {req.employee.lastName}</TableCell>
                                    <TableCell>{req.leaveType.name}</TableCell>
                                    <TableCell>
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{req.days}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
