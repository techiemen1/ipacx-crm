"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Phone, Mail, MapPin, Send } from "lucide-react"

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus("submitting")

        // Simulate API call and Auto-Reply
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setStatus("success")

        // In a real app, this would trigger an API route that sends emails via Resend/SendGrid
        // and SMS via Twilio.
        alert("Message sent! You would check your email/phone for an auto-reply demonstration.")
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 container px-4 md:px-6 py-12">
                <div className="grid gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">Contact Us</h1>
                            <p className="text-muted-foreground">
                                Get in touch with us for your dream home.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="mt-1 h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Visit Us</h3>
                                    <address className="not-italic text-sm text-muted-foreground">
                                        Flat No:102, Site:22, 1st floor, Lakshmi Nivas,<br />
                                        Jinkethimmanahalli, Varnasi,<br />
                                        Near Anandapra Bus Stand, K R Pura,<br />
                                        Bangalore-560036
                                    </address>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Call Us</h3>
                                    <p className="text-sm text-muted-foreground">+91 8884050999</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <p className="text-sm text-muted-foreground">contact@bhunethri.in</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <input id="name" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                                    <input id="phone" required type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="+91 9999999999" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <input id="email" required type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <textarea id="message" required className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="I am interested in..." />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "submitting" || status === "success"}
                                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {status === "submitting" ? "Sending..." : status === "success" ? "Message Sent!" : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}
