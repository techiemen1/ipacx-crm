"use client"

import { format } from "date-fns"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { numberToWords } from "@/lib/utils/number-to-words"

interface InvoiceViewProps {
    invoice: any
    companyProfile?: any
}

export function InvoiceView({ invoice, companyProfile }: InvoiceViewProps) {
    const handlePrint = () => {
        window.print()
    }

    // Default Bhunethri Details if no profile exists
    const companyName = companyProfile?.name || "BHUNETHRI"
    const tagline = companyProfile ? "" : "Developers & Promoters" // Only show default tagline if hardcoded
    const address = companyProfile?.address || "#123, 1st Floor, Main Road, K R Puram, Bangalore, Karnataka, India - 560036"
    const gstin = companyProfile?.gstin || "29AHCPJ2549J1Z5"
    const pan = companyProfile?.pan || "AHCPJ2549J"
    const email = companyProfile?.email || "info@bhunethri.in"
    const phone = companyProfile?.phone || "+91 88840 50999"
    const website = companyProfile?.website || ""

    // Bank Details (Hardcoded for now as CompanyProfile model doesn't have bank fields yet, user request implies foundational step)
    // Ideally we add bank details to CompanyProfile schema later. For now, we use Bhunethri defaults if no profile, or generic placeholder if unknown profile? 
    // Actually, let's keep Bhunethri bank details as default but allow override if we add it to schema later.
    // For this step, we keep bank details hardcoded but aligned with Company Name if it's Bhunethri.
    // If it's a different company, we should probably hide or show placeholder? 
    // Let's just stick to "BHUNETHRI DEVELOPERS" for account name if company name matches, else use Company Name?
    const accountName = companyName === "BHUNETHRI" ? "BHUNETHRI DEVELOPERS" : companyName

    return (
        <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-sm print:shadow-none min-h-[297mm]">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Invoice</h1>
                    <div className="mt-4 text-sm text-slate-600 space-y-1">
                        <p><span className="font-semibold text-slate-500 w-24 inline-block">Invoice No #</span> <span className="font-bold text-slate-900">{invoice.invoiceNo}</span></p>
                        <p><span className="font-semibold text-slate-500 w-24 inline-block">Invoice Date</span> {format(new Date(invoice.issuedDate), "dd MMM, yyyy")}</p>
                        <p><span className="font-semibold text-slate-500 w-24 inline-block">Due Date</span> {format(new Date(invoice.dueDate), "dd MMM, yyyy")}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex flex-col items-end">
                        <h2 className="text-3xl font-extrabold text-[#1a365d] tracking-wider uppercase">{companyName}</h2>
                        {tagline && <p className="text-xs text-slate-500 font-semibold tracking-[0.2em] uppercase mt-1">{tagline}</p>}
                        {website && <p className="text-xs text-slate-500 font-medium mt-1">{website}</p>}
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <h3 className="text-[#1a365d] font-semibold mb-2 text-lg">Billed By</h3>
                    <div className="text-sm text-slate-700 space-y-1 font-medium">
                        <p className="font-bold text-slate-900 uppercase">{companyName}</p>
                        <p className="whitespace-pre-line">{address}</p>
                        {companyProfile?.country && <p>{companyProfile.country}</p>}
                        <p className="mt-2"><span className="font-bold">GSTIN:</span> {gstin}</p>
                        <p><span className="font-bold">PAN:</span> {pan}</p>
                        <p><span className="font-bold">Email:</span> {email}</p>
                        <p><span className="font-bold">Phone:</span> {phone}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <h3 className="text-[#1a365d] font-semibold mb-2 text-lg">Billed To</h3>
                    <div className="text-sm text-slate-700 space-y-1 font-medium">
                        <p className="font-bold text-slate-900 uppercase">{invoice.customer.name}</p>
                        <p className="whitespace-pre-line">{invoice.customer.address || "Address not provided"}</p>
                        {invoice.customer.email && <p><span className="font-bold">Email:</span> {invoice.customer.email}</p>}
                        {invoice.customer.phone && <p><span className="font-bold">Phone:</span> {invoice.customer.phone}</p>}
                        <p className="mt-2"><span className="font-bold">GSTIN:</span> {invoice.customer.gstin || "N/A"}</p>
                        <p><span className="font-bold">PAN:</span> {invoice.customer.pan || "N/A"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 text-xs font-semibold text-slate-500 mb-2 px-1">
                <p>Country of Supply: {companyProfile?.country || "India"}</p>
                <p className="text-right">Place of Supply: {invoice.placeOfSupply || "Karnataka (29)"}</p>
            </div>

            {/* Items Table */}
            <div className="mb-0">
                <div className="bg-[#1a365d] text-white text-sm font-semibold rounded-t-lg">
                    <div className="grid grid-cols-12 gap-2 p-3">
                        <div className="col-span-4 pl-2">Item</div>
                        <div className="col-span-1 text-center">GST Rate</div>
                        <div className="col-span-1 text-center">Qty</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Tax Amt</div>
                        <div className="col-span-2 text-right pr-2">Total</div>
                    </div>
                </div>
                <div className="border-x border-b rounded-b-lg bg-slate-50/30">
                    {invoice.invoiceItems.map((item: any, idx: number) => {
                        const amount = item.quantity * item.rate
                        const taxAmt = (amount * (item.taxRate || 0)) / 100
                        const total = amount + taxAmt
                        return (
                            <div key={item.id} className="grid grid-cols-12 gap-2 p-3 text-sm border-b last:border-0 border-slate-100 items-start">
                                <div className="col-span-4 pl-2 font-medium">
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">{idx + 1}.</span>
                                        <span>{item.description}</span>
                                    </div>
                                </div>
                                <div className="col-span-1 text-center text-slate-600">{item.taxRate}%</div>
                                <div className="col-span-1 text-center text-slate-600">{item.quantity}</div>
                                <div className="col-span-2 text-right text-slate-600">₹{item.rate.toLocaleString('en-IN')}</div>
                                <div className="col-span-2 text-right text-slate-600">₹{taxAmt.toLocaleString('en-IN')}</div>
                                <div className="col-span-2 text-right pr-2 font-semibold">₹{total.toLocaleString('en-IN')}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-between mt-6">
                <div className="w-[55%]">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total (in words)</p>
                    <p className="text-sm font-semibold text-slate-800 italic bg-slate-50 p-2 rounded border border-slate-100 capitalize">
                        {numberToWords(invoice.totalAmount)}
                    </p>

                    <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-[#1a365d] font-semibold mb-3 text-sm">Bank Details</h4>
                        <div className="grid grid-cols-[120px_1fr] text-sm gap-y-1">
                            <span className="font-medium text-slate-600">Account Name</span>
                            <span className="font-bold text-slate-800">{accountName}</span>

                            <span className="font-medium text-slate-600">Account Number</span>
                            <span className="font-bold text-slate-800">200000888907</span>

                            <span className="font-medium text-slate-600">IFSC</span>
                            <span className="font-bold text-slate-800">INDB0000008</span>

                            <span className="font-medium text-slate-600">Bank</span>
                            <span className="font-bold text-slate-800">Indusind Bank</span>

                            <span className="font-medium text-slate-600">Account Type</span>
                            <span className="font-bold text-slate-800">Current</span>
                        </div>
                    </div>
                </div>
                <div className="w-[40%]">
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Sub Total</span>
                            <span className="font-bold text-slate-800">₹{invoice.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Total Tax (GST)</span>
                            <span className="font-bold text-slate-800">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xl border-t border-slate-300 pt-3">
                            <span className="font-bold text-slate-800">Total (INR)</span>
                            <span className="font-bold text-slate-900">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-4 border-t border-dashed border-slate-300">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-500 space-y-1">
                        <p><span className="font-bold">Terms and Conditions:</span></p>
                        <p>1. Payment will be made immediately</p>
                    </div>
                    <div className="text-xs text-slate-400">
                        Page 1 of 1
                    </div>
                </div>
                <div className="text-center mt-8 text-xs text-slate-400">
                    This is an electronically generated document, no signature is required.
                </div>
            </div>

            {/* Print Button Wrapper - Hidden in Print */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <Button onClick={handlePrint} size="lg" className="shadow-xl">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Download PDF
                </Button>
            </div>
        </div>
    )
}
