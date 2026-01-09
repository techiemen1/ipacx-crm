"use client"

import { useActionState, useState } from "react"
import { authenticate } from "@/lib/actions"


export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
    const [email, setEmail] = useState("")

    return (
        <div className="flex min-h-screen">
            {/* Left Side: Professional Image & Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 text-white p-12 max-w-lg">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-xl">B</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Bhunethri</h1>
                    </div>
                    <blockquote className="text-xl font-medium leading-relaxed border-l-4 border-amber-500 pl-6">
                        &quot;Building the future with precision and excellence. Your trusted partner in real estate and construction management.&quot;
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Clean Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50/50 p-8">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                        <p className="text-sm text-gray-500">
                            Enter your credentials to access the ERP Dashboard
                        </p>
                    </div>

                    <form className="space-y-6" action={formAction}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="flex h-12 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                    placeholder="admin@bhunethri.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="flex h-12 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                    defaultValue="password123"
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full justify-center items-center h-12 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    <p className="px-8 text-center text-xs text-muted-foreground">
                        By clicking continue, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
