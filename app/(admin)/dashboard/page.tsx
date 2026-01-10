import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Building, IndianRupee, Activity, TrendingUp, ArrowUpRight, Clock, Star } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {

    // Fetch real data
    const totalRevenueAgg = await prisma.invoice.aggregate({
        where: { status: 'Paid' },
        _sum: { totalAmount: true }
    })
    const totalRevenue = totalRevenueAgg._sum.totalAmount || 0

    const activeLeadsCount = await prisma.customer.count({
        where: { status: 'Lead' }
    })

    // Assuming Properties Sold = Invoices for Project/Property or just Deals won
    const propertiesSold = await prisma.cRMDeal.count({
        where: { stage: 'Won' }
    })

    // Site Visits from Activities
    const siteVisits = await prisma.activity.count({
        where: { type: 'Site Visit' }
    })

    const stats = [
        {
            name: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            icon: IndianRupee,
            change: "Real-time",
            trend: "up",
            desc: "Paid Invoices",
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            name: "Active Leads",
            value: activeLeadsCount.toString(),
            icon: Users,
            change: "Real-time",
            trend: "up",
            desc: "Total Leads",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            name: "Deals Won",
            value: propertiesSold.toString(),
            icon: Building,
            change: "Real-time",
            trend: "up",
            desc: "Closed Deals",
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            name: "Site Visits",
            value: siteVisits.toString(),
            icon: Activity,
            change: "Real-time",
            trend: "up",
            desc: "Recorded Visits",
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
                        Welcome back, Admin. Real-time insights from your application.
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
                            <IndianRupee className="h-5 w-5" />
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
                            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                <TrendingUp className="h-3 w-3" /> {stat.change}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-muted-foreground">{stat.name}</h3>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-sm text-muted-foreground py-8">
                Dashboard updated with real-time data. {totalRevenue === 0 && "No data available (System Reset)."}
            </div>
        </div>
    )
}
