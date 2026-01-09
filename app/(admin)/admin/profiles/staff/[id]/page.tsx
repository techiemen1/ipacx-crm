"use client"

import { use } from "react"
import { User, Phone, Mail, MapPin, Briefcase, Calendar, Award } from "lucide-react"

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    // Mock Data - In a real app fetch using resolvedParams.id
    const staff = {
        id: resolvedParams.id,
        name: "Sneha Reddy",
        role: "Senior Architect",
        department: "Design & Planning",
        email: "sneha.arch@bhunethri.in",
        phone: "+91 9988776622",
        joinDate: "2023-06-15",
        address: "Koramangala, Bangalore",
        status: "Active",
        projects: [
            { name: "Lakshmi Nivas", role: "Lead Architect", status: "Completed" },
            { name: "Varnasi Layout", role: "Consultant", status: "In Progress" }
        ],
        performance: {
            attendance: "95%",
            projectsCompleted: 12,
            rating: "4.8/5"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Staff Profile</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {staff.status}
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
                            <User className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">{staff.name}</h2>
                        <p className="text-muted-foreground">{staff.role}</p>
                        <div className="mt-4 flex flex-col gap-2 text-sm text-left">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" /> {staff.email}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" /> {staff.phone}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" /> {staff.address}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" /> Joined: {staff.joinDate}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Award className="h-4 w-4" /> Performance Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Attendance</span>
                                <span className="font-bold">{staff.performance.attendance}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Projects Done</span>
                                <span className="font-bold">{staff.performance.projectsCompleted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Rating</span>
                                <span className="font-bold text-primary">{staff.performance.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5" /> Assigned Projects
                        </h3>
                        <div className="space-y-4">
                            {staff.projects.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div>
                                        <h4 className="font-medium">{p.name}</h4>
                                        <p className="text-sm text-muted-foreground">Role: {p.role}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4">Salary & Documents</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors">
                                <span className="text-2xl font-bold mb-1">₹ 75,000</span>
                                <span className="text-xs text-muted-foreground">Current Monthly Salary</span>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors">
                                <span className="font-semibold mb-1">Offer Letter.pdf</span>
                                <span className="text-xs text-muted-foreground">Click to view</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
