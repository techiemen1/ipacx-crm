import { prisma } from "@/lib/prisma"
import LeaveManagement from "@/components/admin/hr/leave-management"

export default async function Page() {
    const [leaveTypes, leaveRequests, employees] = await Promise.all([
        prisma.hRLeaveType.findMany(),
        prisma.hRLeaveRequest.findMany({
            include: { employee: true, leaveType: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.employee.findMany({ orderBy: { firstName: 'asc' } }) // For creating new requests (future)
    ])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Manage policies, approvals and leave history.</p>
            <LeaveManagement
                leaveTypes={leaveTypes}
                leaveRequests={leaveRequests}
                employees={employees}
            />
        </div>
    )
}
