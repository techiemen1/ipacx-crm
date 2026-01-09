"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"
import { logCommunication } from "@/lib/communication-actions"

interface MessageComposerProps {
    recipients: { id: string; name: string; type: string; email?: string; phone?: string }[]
}

export function MessageComposer({ recipients }: MessageComposerProps) {
    const [loading, setLoading] = useState(false)
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [recipientType, setRecipientType] = useState("Customer")
    const [selectedRecipient, setSelectedRecipient] = useState("all") // 'all' or specific ID

    // Filter recipients based on type
    const filteredRecipients = recipients.filter(r => r.type === recipientType)

    async function handleSend() {
        if (!subject || !body) return toast.error("Subject and message body required")

        setLoading(true)

        // Mock sending to "All" by creating multiple logs
        const targets = selectedRecipient === "all" ? filteredRecipients : filteredRecipients.filter(r => r.id === selectedRecipient)

        if (targets.length === 0) {
            setLoading(false)
            return toast.error("No recipients found")
        }

        let sentCount = 0

        // Sequentially log (or in parallel)
        for (const target of targets) {
            await logCommunication({
                subject,
                body,
                recipientType,
                recipientId: target.id,
                status: "Sent" // Assumed successful for mock
            })
            sentCount++
        }

        setLoading(false)
        toast.success(`Message sent to ${sentCount} recipients`)
        setSubject("")
        setBody("")
    }

    return (
        <div className="space-y-4 border p-6 rounded-xl bg-card">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Send className="h-5 w-5" /> New Message
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Recipient Group</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Customer">Customers</SelectItem>
                            <SelectItem value="Vendor">Vendors</SelectItem>
                            <SelectItem value="Employee">Employees</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Recipient" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All {recipientType}s ({filteredRecipients.length})</SelectItem>
                            {filteredRecipients.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Project Update, Payment Reminder" />
            </div>

            <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[150px]"
                />
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSend} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Message
                </Button>
            </div>
        </div>
    )
}
