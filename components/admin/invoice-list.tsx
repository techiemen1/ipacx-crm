"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { RecordPaymentModal } from "./record-payment-modal"

interface InvoiceListProps {
    initialInvoices: any[]
}

export function InvoiceList({ initialInvoices }: InvoiceListProps) {
    if (initialInvoices.length === 0) {
        return <div className="text-muted-foreground text-sm py-4">No invoices found.</div>
    }

    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

    const handleRecordPayment = (invoice: any) => {
        setSelectedInvoice(invoice)
        setPaymentModalOpen(true)
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                <Link href={`/admin/accounts/invoices/${invoice.id}`} className="hover:underline text-blue-600">
                                    {invoice.invoiceNo}
                                </Link>
                            </TableCell>
                            <TableCell>{invoice.customer?.name || "Unknown"}</TableCell>
                            <TableCell>{new Date(invoice.issuedDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge variant={invoice.status === 'Paid' ? 'secondary' : 'outline'} className={
                                    invoice.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                        invoice.status === 'Overdue' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''
                                }>
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                ₹{invoice.totalAmount ? invoice.totalAmount.toLocaleString() : invoice.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoiceNo)}>
                                            Copy Invoice No
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <Link href={`/admin/accounts/invoices/${invoice.id}`}>
                                            <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                        </Link>
                                        <Link href={`/admin/accounts/invoices/${invoice.id}/edit`}>
                                            <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem onClick={() => handleRecordPayment(invoice)}>
                                            Record Payment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedInvoice && (
                <RecordPaymentModal
                    invoice={selectedInvoice}
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                />
            )}
        </>
    )
}
