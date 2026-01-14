import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendEmployeeBroadcast } from "@/lib/actions"
import { Send, Users, Building, User } from "lucide-react"

export default async function CommunicationsPage() {
    // Fetch departments and employees for filters
    const departments = await prisma.hRDepartment.findMany()
    const allEmployees = await prisma.employee.findMany({
        where: { status: 'Active' },
        select: { id: true, firstName: true, lastName: true, code: true }
    })

    const logs = await prisma.communicationLog.findMany({
        orderBy: { sentAt: 'desc' },
        take: 10
    })

    async function handleBroadcastWrapper(formData: FormData) {
        "use server"
        await sendEmployeeBroadcast(formData)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Communications Center</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Compose Message */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Compose Broadcast
                        </CardTitle>
                        <CardDescription>Send email notifications to your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleBroadcastWrapper} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <Select name="targetType" defaultValue="ALL">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" /> All Employees
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="DEPARTMENT">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" /> Specific Department
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="EMPLOYEE">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" /> Single Employee
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Client-side conditional logic is tricky in server components. 
                                We'll just provide both selects and let the user pick the right one.
                                The server action will grab the one that has a value.
                            */}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">If Department selected:</Label>
                                    <Select name="targetId_dept">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">If Employee selected:</Label>
                                    <Select name="targetId_emp">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allEmployees.map(e => (
                                                <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <p className="text-xs text-amber-600">
                                * Note: Ensure you select the correct ID corresponding to your Target Type.
                            </p>

                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input name="subject" placeholder="e.g., Important Policy Update" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea name="message" placeholder="Type your message here..." className="min-h-[150px]" required />
                            </div>

                            <Button type="submit" className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Send Broadcast
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sent History</CardTitle>
                        <CardDescription>Recent broadcasts and notifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No history available.</p>
                            ) : logs.map((log) => (
                                <div key={log.id} className="flex flex-col space-y-1 rounded-lg border p-3 text-sm">
                                    <div className="flex items-center justify-between font-medium">
                                        <span>{log.subject}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>To: {log.recipientType}</span>
                                        <span>{new Date(log.sentAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {log.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
