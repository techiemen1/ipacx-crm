"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShieldAlert, Clock, RefreshCw, Download } from "lucide-react"
import { toast } from "sonner"
import { getLogs, deleteOldLogs } from "@/lib/log-actions"

interface Log {
    id: string
    action: string
    module: string
    description: string
    timestamp: Date
    user: { name: string | null, email: string } | null
}

export function ActivityLogs() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        const res = await getLogs(50) // Fetch last 50
        if (res.success && res.data) {
            setLogs(res.data)
        } else {
            toast.error("Failed to load audit logs")
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    async function handleCleanup() {
        if (!confirm("Are you sure? This will delete all logs older than 30 days.")) return
        setDeleting(true)
        const res = await deleteOldLogs(30)
        if (res.success) {
            toast.success(`Deleted ${res.count} old logs`)
            fetchLogs()
        } else {
            toast.error(res.error || "Failed to cleanup logs")
        }
        setDeleting(false)
    }

    async function handleExport() {
        if (logs.length === 0) return toast.error("No logs to export")

        const headers = ["Timestamp", "User Name", "User Email", "Module", "Action", "Description"]
        const csvContent = [
            headers.join(","),
            ...logs.map(log => [
                new Date(log.timestamp).toISOString(),
                `"${log.user?.name || 'System'}"`,
                `"${log.user?.email || ''}"`,
                `"${log.module}"`,
                `"${log.action}"`,
                `"${log.description.replace(/"/g, '""')}"` // Escape quotes
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">System Activity Logs</h3>
                    <p className="text-sm text-slate-500">Audit trail of actions performed by users.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchLogs}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleCleanup} disabled={deleting}>
                        <Trash2 className="h-4 w-4 mr-2" /> Clear Old Logs
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Loading activity logs...
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldAlert className="h-8 w-8 text-slate-300" />
                                        <p>No activity recorded yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{log.user?.name || "System"}</div>
                                        <div className="text-xs text-slate-500">{log.user?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">{log.module}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs font-semibold text-slate-700">{log.action}</span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 max-w-[300px] truncate" title={log.description}>
                                        {log.description}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-center text-slate-400">Showing last 50 records.</p>
        </div>
    )
}
