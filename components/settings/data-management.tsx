"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileJson, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { bulkImportLeads, exportSystemData, importSystemData } from "@/lib/data-actions"

export function DataManagement() {
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [leadFile, setLeadFile] = useState<File | null>(null)
    const [backupFile, setBackupFile] = useState<File | null>(null)

    // --- Leads Import ---
    async function handleLeadsImport() {
        if (!leadFile) return toast.error("Please select a CSV file")

        setImporting(true)
        const formData = new FormData()
        formData.append("file", leadFile)

        try {
            const res = await bulkImportLeads(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Import complete! Included ${res.count} leads.`)
                if (res.errors) toast.warning(`${res.errors} rows failed to import.`)
                setLeadFile(null)
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setImporting(false)
        }
    }

    // --- Backup Export ---
    async function handleExport() {
        setExporting(true)
        try {
            const res = await exportSystemData()
            if (res.error) {
                toast.error(res.error)
            } else {
                // Trigger download
                const blob = new Blob([res.data!], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `bhunethri-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success("Backup downloaded successfully")
            }
        } catch (e) {
            toast.error("Export failed")
        } finally {
            setExporting(false)
        }
    }

    // --- Restore Import ---
    async function handleRestore() {
        if (!backupFile) return toast.error("Please select a JSON backup file")

        if (!confirm("WARNING: This will overwrite or merge data into the current system. Are you absolutely sure?")) return

        setRestoring(true)
        try {
            const text = await backupFile.text()
            const res = await importSystemData(text)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("System restore completed successfully")
                setBackupFile(null)
            }
        } catch (e) {
            toast.error("Restore failed. Invalid file format.")
        } finally {
            setRestoring(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Data Management</h3>
                    <p className="text-sm text-slate-500">Import leads, backup your system, or restore data.</p>
                </div>
            </div>

            <Tabs defaultValue="leads" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="leads">Bulk Leads</TabsTrigger>
                    <TabsTrigger value="backup">System Backup</TabsTrigger>
                </TabsList>

                {/* Import Leads Tab */}
                <TabsContent value="leads" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import Leads</CardTitle>
                            <CardDescription>Upload a CSV file with columns: Name, Email, Phone, Project Interest, Address.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="leads-csv">CSV File</Label>
                                <Input
                                    id="leads-csv"
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setLeadFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-600">
                                <p className="font-medium mb-2">CSV Format Example:</p>
                                <code className="block bg-white p-2 border rounded text-xs overflow-x-auto">
                                    Name,Email,Phone,Project Interest,Status<br />
                                    John Doe,john@example.com,9876543210,Villa Project,Lead
                                </code>
                            </div>
                            <Button
                                onClick={handleLeadsImport}
                                disabled={importing || !leadFile}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {importing ? "Importing..." : <><Upload className="mr-2 h-4 w-4" /> Import Leads</>}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backup & Restore Tab */}
                <TabsContent value="backup" className="mt-4 space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Export Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Export Data</CardTitle>
                                <CardDescription>Download a full JSON backup of your database.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-amber-50 text-amber-800 rounded-md text-sm flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>This includes all users, customers, invoices, expenses, projects, and settings. Keep this file secure.</p>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {exporting ? "Generating Backup..." : <><Download className="mr-2 h-4 w-4" /> Download Backup</>}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Import Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Restore Data</CardTitle>
                                <CardDescription>Restore your system from a backup file.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="backup-json">Backup File (JSON)</Label>
                                    <Input
                                        id="backup-json"
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>Caution: This will merge data. Existing records with same IDs will be updated. New records will be created.</p>
                                </div>
                                <Button
                                    onClick={handleRestore}
                                    disabled={restoring || !backupFile}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    {restoring ? "Restoring..." : <><Upload className="mr-2 h-4 w-4" /> Restore from Backup</>}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
