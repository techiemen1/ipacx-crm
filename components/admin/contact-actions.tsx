"use client"

import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageCircle } from "lucide-react"

interface ContactActionsProps {
    phone?: string | null
    email?: string | null
    className?: string
}

export function ContactActions({ phone, email, className }: ContactActionsProps) {
    const handleWhatsApp = () => {
        if (!phone) return
        const cleanPhone = phone.replace(/\D/g, '')
        window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }

    const handleEmail = () => {
        if (!email) return
        window.open(`mailto:${email}`, '_blank')
    }

    const handleCall = () => {
        if (!phone) return
        window.open(`tel:${phone}`, '_self')
    }

    if (!phone && !email) return null

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {phone && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={handleWhatsApp}
                        title="WhatsApp"
                    >
                        <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={handleCall}
                        title="Call"
                    >
                        <Phone className="h-4 w-4" />
                    </Button>
                </>
            )}

            {email && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                    onClick={handleEmail}
                    title="Email"
                >
                    <Mail className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
