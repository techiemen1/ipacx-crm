"use client"

import { use } from "react"
import { User, Phone, Mail, Home, FileText, CheckCircle, Clock } from "lucide-react"

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)

    const client = {
        id: resolvedParams.id,
        name: "John Smith",
        email: "john@gmail.com",
        phone: "+91 9988776655",
        address: "Indiranagar, Bangalore",
        property: {
            name: "Lakshmi Nivas - Flat 101",
            price: "₹ 65,00,000",
            paid: "₹ 45,00,000",
            due: "₹ 20,00,000",
            handoverDate: "2026-03-15"
        },
        documents: [
            { name: "Sale Agreement", status: "Verified" },
            { name: "Identity Proof", status: "Verified" },
            { name: "Loan Sanction Letter", status: "Pending" }
        ],
        timeline: [
            { title: "Booking Confirmed", date: "2025-12-01", status: "done" },
            { title: "Agreement Signed", date: "2025-12-10", status: "done" },
            { title: "Payment 1 Received", date: "2025-12-15", status: "done" },
            { title: "Registration", date: "Estimated Feb 2026", status: "pending" }
        ]
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Client Profile: {client.name}</h1>
                <div className="flex gap-2">
                    <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Send Reminder
                    </button>
                    <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Edit Details
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Col: Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{client.name}</h2>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active Client</span>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" /> {client.email}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" /> {client.phone}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Home className="h-4 w-4" /> {client.address}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</h3>
                        <div className="space-y-2">
                            {client.documents.map((doc, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 border rounded-md hover:bg-muted/50">
                                    <span>{doc.name}</span>
                                    {doc.status === 'Verified' ?
                                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Property & Timeline */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4">Property Details & Financials</h3>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Property Name</p>
                                <p className="font-medium text-lg">{client.property.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Handover Date</p>
                                <p className="font-medium">{client.property.handoverDate}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Total Price</span>
                                <span className="font-bold text-lg">{client.property.price}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                                {/* Mock progress bar 45/65 approx 70% */}
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-green-600 font-medium">Paid: {client.property.paid}</span>
                                <span className="text-red-600 font-medium">Due: {client.property.due}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4">Activity Timeline</h3>
                        <div className="space-y-6 relative border-l ml-2 pl-6">
                            {client.timeline.map((item, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute -left-[31px] bg-background border-2 rounded-full h-4 w-4 ${item.status === 'done' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}></div>
                                    <h4 className="font-medium text-sm">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground">{item.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
