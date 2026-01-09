"use client"

import React, { createContext, useContext } from "react"
import { useSession } from "next-auth/react"
import { User, Role } from "./types"
import { logoutAction } from "./actions"

interface AuthContextType {
    user: User | null
    login: (email: string) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    // Map NextAuth session user to our App User type
    const user: User | null = session?.user ? {
        id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (session.user as any).role as Role || "STAFF",
        avatar: session.user.image || undefined
    } : null

    const loading = status === "loading" && !session

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = async (_email: string) => {
        // No-op: Login is handled by form action now
        console.warn("AuthContext.login is deprecated. Use server action.")
    }

    const logout = async () => {
        await logoutAction()
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
