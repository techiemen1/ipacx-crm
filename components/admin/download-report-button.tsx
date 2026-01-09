"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { exportSystemData } from "@/lib/data-actions"

export function DownloadReportButton() {
    async function handleDownload() {
        try {
            toast.info("Generating report...")
            const res = await exportSystemData()
            if (res.error) {
                toast.error(res.error)
            } else if (res.data) {
                // Create a blob and download
                const blob = new Blob([res.data], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `bhunethri-report-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success("Report downloaded")
            }
        } catch (e) {
            toast.error("Failed to download report")
        }
    }

    return (
        <Button variant="outline" onClick={handleDownload}>Download Report</Button>
    )
}
