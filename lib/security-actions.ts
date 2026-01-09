"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hash, compare } from "bcryptjs"

const VAULT_KEY = "APP_VAULT_PIN"

// --- Tally Vault (App Lock) ---

export async function setVaultPin(pin: string) {
    if (pin.length < 4) return { error: "PIN must be at least 4 digits" }

    try {
        const hashed = await hash(pin, 10)
        await prisma.appConfig.upsert({
            where: { key: VAULT_KEY },
            update: { value: hashed },
            create: { key: VAULT_KEY, value: hashed }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch {
        return { error: "Failed to set PIN" }
    }
}

export async function verifyVaultPin(pin: string) {
    try {
        const config = await prisma.appConfig.findUnique({
            where: { key: VAULT_KEY }
        })
        if (!config) return { success: true } // No PIN set implies access allowed or setup needed. Usually we want fail-safe. 
        // Let's assume if no PIN, it's open or we redirect to setup. 
        // Returning true here allows access if not set.

        const isValid = await compare(pin, config.value)
        return { success: isValid }
    } catch {
        return { success: false }
    }
}

export async function isVaultSet() {
    const config = await prisma.appConfig.findUnique({
        where: { key: VAULT_KEY }
    })
    return !!config
}

// --- RBAC ---

export async function getRoles() {
    return await prisma.role.findMany({ include: { _count: { select: { users: true } } } })
}

export async function createRole(name: string, permissions: string[]) {
    try {
        await prisma.role.create({
            data: {
                name,
                permissions: JSON.stringify(permissions)
            }
        })
        revalidatePath("/admin/settings/security")
        return { success: true }
    } catch {
        return { error: "Failed to create role" }
    }
}

export async function assignRole(userId: string, roleId: string) {
    try {
        // Remove existing roles for simplicity (Single Role model for now usually) 
        // Or keep multiple. Let's start clean for this user.
        await prisma.userRole.deleteMany({ where: { userId } })

        await prisma.userRole.create({
            data: { userId, roleId }
        })
        revalidatePath("/admin/hr")
        return { success: true }
    } catch {
        return { error: "Failed to assign role" }
    }
}
