"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Building, DollarSign, Activity, TrendingUp, ArrowUpRight, Clock, Star } from "lucide-react"

export default function DashboardPage() {

    const stats = [
        {
            name: "Total Revenue",
            value: "₹2.4 Cr",
            icon: DollarSign,
            change: "+12.5%",
            trend: "up",
            desc: "vs last month",
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            name: "Active Leads",
            value: "142",
            icon: Users,
            change: "+8.2%",
            trend: "up",
            desc: "12 new today",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            name: "Properties Sold",
            value: "24",
            icon: Building,
            change: "-2%",
            trend: "down",
            desc: "This quarter",
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            name: "Site Visits",
            value: "86",
            icon: Activity,
            change: "+24%",
            trend: "up",
            desc: "This week",
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Executive Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
                <div className="relative z-10 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Executive Overview
                    </h1>
                    <p className="text-slate-300 max-w-xl">
                        Welcome back, Admin. Here's what's happening across your projects and CRM today.
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[120px] hover:border-primary hover:bg-primary/5 transition-colors" asChild>
                    <Link href="/admin/accounts/invoices/new">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">New Invoice</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[120px] hover:border-primary hover:bg-primary/5 transition-colors" asChild>
                    <Link href="/admin/crm?action=new">
                        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">Add Lead</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[120px] hover:border-primary hover:bg-primary/5 transition-colors" asChild>
                    <Link href="/admin/accounts/expenses/new">
                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">Add Expense</span>
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-center justify-between pb-4">
                            <div className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            {stat.trend === 'up' ? (
                                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                    <TrendingUp className="h-3 w-3" /> {stat.change}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                    <TrendingUp className="h-3 w-3 rotate-180" /> {stat.change}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-muted-foreground">{stat.name}</h3>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-7">

                {/* Recent Leads Feed */}
                <div className="col-span-4 rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b p-6">
                        <div className="space-y-1">
                            <h3 className="font-semibold leading-none tracking-tight">Recent Inquiries</h3>
                            <p className="text-sm text-muted-foreground">Latest leads from all sources</p>
                        </div>
                        <button className="text-xs font-medium text-primary hover:underline">View All</button>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium leading-none">Potential Buyer {i}</p>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> 2h ago
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">Interested in 3BHK Villa at Emerald Greens, budget around 1.5 Cr...</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">New Lead</span>
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">3BHK</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Project Status */}
                <div className="col-span-3 space-y-6">
                    <div className="rounded-2xl border bg-card shadow-sm h-full">
                        <div className="flex items-center justify-between border-b p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Project Milestones</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Building className="h-4 w-4 text-blue-500" />
                                        Lakshmi Nivas
                                    </div>
                                    <span className="text-muted-foreground">92%</span>
                                </div>
                                <div className="h-2 rounded-full bg-secondary">
                                    <div className="h-full w-[92%] rounded-full bg-blue-600"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Building className="h-4 w-4 text-amber-500" />
                                        Varnasi Layout
                                    </div>
                                    <span className="text-muted-foreground">45%</span>
                                </div>
                                <div className="h-2 rounded-full bg-secondary">
                                    <div className="h-full w-[45%] rounded-full bg-amber-500"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Building className="h-4 w-4 text-emerald-500" />
                                        Sunrise Towers
                                    </div>
                                    <span className="text-muted-foreground">12%</span>
                                </div>
                                <div className="h-2 rounded-full bg-secondary">
                                    <div className="h-full w-[12%] rounded-full bg-emerald-500"></div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/10 p-2">
                                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Top Performer</p>
                                        <p className="text-xs text-slate-400">Sales Person: Sarah J.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
