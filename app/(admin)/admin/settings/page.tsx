import { DataManagement } from "@/components/settings/data-management"
import PayrollSetup from "@/components/admin/hr/payroll-setup"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UserManagement } from "@/components/admin/user-management"
import { CompanySettings } from "@/components/settings/company-settings"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { hasPermission, getRedirectPath } from "@/lib/rbac"
import { redirect } from "next/navigation"
import { CommunicationSettings } from "@/components/settings/communication-settings"
import { ActivityLogs } from "@/components/settings/activity-logs"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any).role

    if (!hasPermission(role, "SETTINGS")) {
        redirect(getRedirectPath(role))
    }

    // Fetch users only if Admin
    const users = role === "ADMIN"
        ? await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, profile: { select: { designation: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        })
        : []

    // Fetch companies
    const companiesRaw = await prisma.companyProfile.findMany({
        orderBy: { isDefault: 'desc' }
    })

    // Serialize dates for client component
    const companies = companiesRaw.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
    }))

    // Fetch HR Config Data
    const [departments, designations, payHeads, shifts] = await Promise.all([
        prisma.hRDepartment.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRDesignation.findMany({ orderBy: { name: 'asc' } }),
        prisma.hRPayHead.findMany({ orderBy: { type: 'asc' } }),
        prisma.hRShift.findMany({ orderBy: { name: 'asc' } })
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
                    <TabsTrigger value="profile">My Profile</TabsTrigger>
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                    <TabsTrigger value="hr">HR & Payroll</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                    {role === "ADMIN" && <TabsTrigger value="logs">Activity Logs</TabsTrigger>}
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">My Profile</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50">
                                    {session.user.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50">
                                    {session.user.email}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Preferences</h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Email Notifications</label>
                                    <p className="text-xs text-muted-foreground">Receive leads summaries.</p>
                                </div>
                                <input type="checkbox" className="h-4 w-4" defaultChecked />
                            </div>
                        </div>
                    </div>

                    {role === "ADMIN" && (
                        <>
                            <Separator />
                            <UserManagement initialUsers={users} />
                        </>
                    )}
                </TabsContent>

                <TabsContent value="organization" className="space-y-6 mt-6">
                    <CompanySettings initialCompanies={companies} />
                </TabsContent>

                <TabsContent value="data" className="space-y-6 mt-6">
                    <DataManagement />
                </TabsContent>

                <TabsContent value="hr" className="space-y-6 mt-6">
                    <PayrollSetup
                        departments={departments}
                        designations={designations}
                        payHeads={payHeads}
                        shifts={shifts}
                    />
                </TabsContent>

                <TabsContent value="communication" className="space-y-6 mt-6">
                    <CommunicationSettings />
                </TabsContent>

                {role === "ADMIN" && (
                    <TabsContent value="logs" className="space-y-6 mt-6">
                        <ActivityLogs />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

