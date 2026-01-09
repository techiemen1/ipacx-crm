import { Phone, MapPin } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="w-full border-t bg-muted/40">
            <div className="container grid gap-8 py-10 px-4 md:px-6 lg:grid-cols-3">
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Bhunethri.in</h4>
                    <p className="text-sm text-muted-foreground">
                        Premium Real Estate Developers, Builders, and Architects.
                        <br />
                        Leading projects across Bangalore.
                    </p>
                </div>
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Contact Us</h4>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <address className="not-italic">
                            Flat No:102, Site4:22, 1st floor, Lakshmi Nivas,
                            <br />
                            Jinkethimmanahalli, Varnasi,
                            <br />
                            Near Anandapra Bus Stand, K R Pura,
                            <br />
                            Bangalore-560036
                        </address>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a href="tel:+918884050999">+91 8884050999</a>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Quick Links</h4>
                    <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <a className="hover:underline" href="/privacy">Privacy Policy</a>
                        <a className="hover:underline" href="/terms">Terms of Service</a>
                        <a className="hover:underline" href="/admin">Admin Portal</a>
                    </nav>
                </div>
            </div>
            <div className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 sm:flex-row text-xs text-muted-foreground">
                    <p>© 2026 Bhunethri.in. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
