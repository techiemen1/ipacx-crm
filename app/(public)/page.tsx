"use client"

import { Button } from "@/components/ui/button"
import { Building2, LayoutDashboard, Database, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section - Clean Corporate */}
        <section className="relative bg-slate-50 py-20 lg:py-32 overflow-hidden">
          <div className="container px-4 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              Now Launching: Green Valley Heights
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
              Building India&apos;s Future with <span className="text-amber-600">Integrity & Excellence</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
              Bhunethri Developers delivers premium real estate solutions. From luxury villas to commercial complexes, we build with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/contact">Enquire Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 text-base" asChild>
                <Link href="#projects">View Projects</Link>
              </Button>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-30">
            <svg className="h-full w-full text-slate-200" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
            </svg>
          </div>
        </section>

        {/* Stats Section - Trust Signals */}
        <section className="py-12 border-y border-slate-100 bg-white">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">12+</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Years Experience</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">50+</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Projects Completed</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">2000+</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Happy Families</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">100%</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Legal Compliance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects - Card Grid */}
        <section id="projects" className="py-20 bg-slate-50">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Projects</h2>
                <p className="text-slate-500">Explore our latest premium developments.</p>
              </div>
              <Button variant="ghost" className="text-amber-700 hover:text-amber-800 hidden md:inline-flex">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Sushant Golf City", loc: "Lucknow", type: "Township", price: "₹85 L - ₹2.5 Cr", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000" },
                { title: "Prestige Tech Park", loc: "Bangalore", type: "Commercial", price: "Lease Only", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000" },
                { title: "Green Acres", loc: "Mysore", type: "Plotted Dev", price: "₹2500 / sqft", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                      {item.type}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{item.title}</h3>
                        <p className="text-slate-500 text-sm flex items-center mt-1"><Building2 className="h-3 w-3 mr-1" /> {item.loc}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-900">{item.price}</span>
                      <Button size="sm" variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-900">Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" className="w-full">View All Projects</Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Simple Icons */}
        <section className="py-20 bg-white">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-16">Why Choose Bhunethri?</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <Database className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Transparent Dealings</h4>
                <p className="text-slate-500 leading-relaxed">No hidden charges. All documents and approvals are shared upfront.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Management</h4>
                <p className="text-slate-500 leading-relaxed">Track your property status and payments through our customer portal.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                  <Building2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Quality Construction</h4>
                <p className="text-slate-500 leading-relaxed">We use only premium materials and work with top-tier architects.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
