import { VoucherForm } from "@/components/accounts/voucher-form"
import { getVouchers } from "@/lib/accounting-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function VouchersPage() {
    const { data: vouchers } = await getVouchers()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Voucher Management</h2>
                    <p className="text-muted-foreground">Manage journal entries, payments, and receipts.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Plus className="mr-2 h-4 w-4" /> New Voucher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Create New Voucher</DialogTitle>
                        </DialogHeader>
                        <VoucherForm onSuccess={async () => {
                            "use server"
                            // Server action revalidator is handled in createVoucher
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {vouchers && vouchers.map((voucher: any) => (
                    <Card key={voucher.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{voucher.voucherNo}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{new Date(voucher.date).toLocaleDateString()} • {voucher.type}</p>
                                </div>
                                <div className="text-sm font-medium bg-slate-100 px-2 py-1 rounded">
                                    {voucher.status}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {voucher.entries.map((entry: any) => (
                                    <div key={entry.id} className="flex justify-between text-sm">
                                        <span>{entry.account.name}</span>
                                        <div className="flex gap-4 text-slate-600">
                                            {entry.debit > 0 && <span>Dr: {entry.debit}</span>}
                                            {entry.credit > 0 && <span>Cr: {entry.credit}</span>}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 text-xs text-slate-500 italic border-t mt-2">
                                    {voucher.narration || "No narration"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!vouchers || vouchers.length === 0) && (
                    <div className="text-center py-10 text-slate-500">
                        No vouchers posted yet. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
