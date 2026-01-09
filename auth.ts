import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                console.log("Attempting login for:", credentials?.email)

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: String(credentials.email) }
                })

                if (!user) {
                    console.log("User not found")
                    return null
                }

                if (!user.password) {
                    console.log("User has no password")
                    return null
                }

                const isPasswordValid = await compare(String(credentials.password), user.password)

                if (!isPasswordValid) {
                    console.log("Invalid password")
                    return null
                }

                console.log("Login successful for user:", user.id)

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        })
    ],
})
