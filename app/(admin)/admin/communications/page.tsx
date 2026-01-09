import { auth } from "@/auth"
import { getCommunicationLogs, getRecipients } from "@/lib/communication-actions"
import { MessageComposer } from "@/components/admin/message-composer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, History } from "lucide-react"

export default async function CommunicationsPage() {
    const session = await auth()
    if (!session) return null

    const logs = await getCommunicationLogs()
    const recipients = await getRecipients()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
                <p className="text-muted-foreground">Send updates to your team, clients, and vendors.</p>
            </div>

            <Tabs defaultValue="compose" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                    <TabsTrigger value="history">Message History</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                    <MessageComposer recipients={recipients} />
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" /> Sent Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.length === 0 && <p className="text-muted-foreground text-center py-8">No messages sent yet.</p>}
                                {logs.map((log) => (
                                    <div key={log.id} className="border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold">{log.subject}</h4>
                                            <span className="text-xs text-muted-foreground">{new Date(log.sentAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2 truncate">{log.body}</p>
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{log.recipientType}</span>
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{log.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
