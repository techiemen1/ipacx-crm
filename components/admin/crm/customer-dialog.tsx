"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { CustomerForm } from "@/components/forms/customer-form"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CustomerDialog() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Add Client</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Client (Lead)</DialogTitle>
                </DialogHeader>
                <CustomerForm onSuccess={() => {
                    setOpen(false)
                    router.refresh()
                }} />
            </DialogContent>
        </Dialog>
    )
}
