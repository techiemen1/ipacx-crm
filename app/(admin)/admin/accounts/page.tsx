import { prisma } from "@/lib/prisma"
import { InvoiceList } from "@/components/admin/invoice-list"
import { IndianRupee, PieChart, TrendingUp, CreditCard, Link as LinkIcon, FolderTree, Target, Landmark } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { DownloadReportButton } from "@/components/admin/download-report-button"

export default async function AccountsPage() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { issuedDate: 'desc' },
        take: 10,
        include: {
            customer: true
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Accounts & Finance</h1>
                <div className="flex gap-2">
                    <DownloadReportButton />
                    <Button asChild>
                        <Link href="/admin/accounts/invoices/new">
                            <LinkIcon className="mr-2 h-4 w-4" /> Create Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/accounts/taxes" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">GST Liability</h3>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₹1.2L</div>
                    <p className="text-xs text-muted-foreground">Input Credit: ₹45k</p>
                </Link>
                <Link href="/admin/accounts/payroll" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Payroll (Jan)</h3>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₹4.5L</div>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                </Link>
                <Link href="/admin/accounts/expenses" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Site Expenses</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₹85k</div>
                    <p className="text-xs text-muted-foreground">This Month</p>
                </Link>

// ... (skipping unchanged lines)

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Net Cashflow</h3>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">+₹12.5L</div>
                    <p className="text-xs text-muted-foreground">Healthy</p>
                </div>
                <Link href="/admin/accounts/vouchers" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Vouchers</h3>
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">Entry</div>
                    <p className="text-xs text-muted-foreground">Journals, Payments, Receipts</p>
                </Link>
                <Link href="/admin/accounts/banking" className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Banking</h3>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">Manage</div>
                    <p className="text-xs text-muted-foreground">Accounts, Cheques, Reconciliation</p>
                </Link>
            </div >

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Cash Flow Trends</h3>
                    <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md text-muted-foreground">
                        Chart Placeholder (Income vs Expense)
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link href="/admin/accounts/expenses/new" className="w-full flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors text-sm">
                            <span>Record Expense</span>
                            <CreditCard className="h-4 w-4" />
                        </Link>
                        <Link href="/admin/accounts/invoices/new" className="w-full flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors text-sm">
                            <span>Generate Invoice</span>
                            <FileTextIcon className="h-4 w-4" />
                        </Link>
                        <Link href="/admin/accounts/payroll" className="w-full flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors text-sm">
                            <span>Process Salaries</span>
                            <UsersIcon className="h-4 w-4" />
                        </Link>
                        <Link href="/admin/accounts/ledger" className="w-full flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors text-sm">
                            <span>Chart of Accounts</span>
                            <FolderTree className="h-4 w-4" />
                        </Link>
                        <Link href="/admin/accounts/cost-centers" className="w-full flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors text-sm">
                            <span>Cost Centers</span>
                            <Target className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Recent Invoices</h3>
                    <Link href="/admin/accounts/invoices" className="text-sm text-amber-600 hover:underline">View All</Link>
                </div>
                <InvoiceList initialInvoices={invoices} />
            </div>
        </div >
    )
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M16 17H8" />
        </svg>
    )
}
