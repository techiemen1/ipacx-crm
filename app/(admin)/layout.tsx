"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Package,
    BarChart3
} from "lucide-react"

import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/rbac"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // We trust Middleware and RootLayout to handle auth redirection.
    // AdminLayout focuses purely on the UI shell.

    // If we are server-rendered with a session (from RootLayout), 
    // user should be available via context immediately or hydration.
    // But if it's truly null even after loading, something is wrong, 
    // but better to let it render the shell than block infinitely.

    useEffect(() => {
        if (!loading && !user) {
            // Force hard navigation to ensure session sync or proper redirect
            window.location.href = "/login"
        }
    }, [loading, user])

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                <div className="text-sm font-medium text-slate-600">Loading Bhunethri Admin...</div>
            </div>
        </div>
    )

    if (!user) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 flex-col gap-4">
            <div className="text-slate-500 animate-pulse">Redirecting to login...</div>
            <button
                onClick={() => window.location.reload()}
                className="text-amber-600 hover:underline text-sm"
            >
                Click here if not redirected
            </button>
        </div>
    )

    // Navigation items based on roles could be filtered here
    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, resource: "CRM" },
        { name: "Properties", href: "/admin/properties", icon: Home, resource: "INVENTORY" },
        { name: "CRM / Leads", href: "/admin/crm", icon: Users, resource: "CRM" },
        { name: "Clients", href: "/admin/profiles/customers", icon: Users, resource: "PROFILES" },
        { name: "Inventory", href: "/admin/inventory", icon: Package, resource: "INVENTORY" },
        { name: "Projects", href: "/admin/projects", icon: Briefcase, resource: "PROJECTS" },
        { name: "Accounts", href: "/admin/accounts", icon: FileText, resource: "ACCOUNTS" },
        { name: "HR", href: "/admin/hr", icon: Users, resource: "HR" },
        { name: "Reports", href: "/admin/reports/cash-flow", icon: BarChart3, resource: "ACCOUNTS" },
        { name: "Settings", href: "/admin/settings", icon: Settings, resource: "SETTINGS" },
    ].filter(item => {
        // Dashboard is accessible to everyone effectively/partially, but let's check basic role
        // For simplified check, let "Dashboard" be visible if they have CRM or PROJECTS or ACCOUNTS
        if (item.name === "Dashboard") return true
        return hasPermission(user?.role, item.resource as any)
    })

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 border-r bg-slate-900 text-white lg:block fixed h-full inset-y-0 z-30 shadow-xl">
                <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight border-b border-white/10">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 mr-3"></div>
                    Bhunethri
                </div>
                <nav className="space-y-1 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                (item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href))
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", pathname?.startsWith(item.href) ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.toLowerCase() || 'admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-md border border-white/10 p-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 lg:hidden sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg text-slate-800">Bhunethri</span>
                </header >

                {/* Mobile Sidebar Overlay */}
                {
                    sidebarOpen && (
                        <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200" onClick={() => setSidebarOpen(false)}>
                            <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-4 shadow-2xl animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-8 px-2">
                                    <span className="font-bold text-xl">Bhunethri</span>
                                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
                                </div>
                                <nav className="space-y-2">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                                pathname === item.href ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-white/5 mt-8"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )
                }

                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div >
        </div >
    )
}
