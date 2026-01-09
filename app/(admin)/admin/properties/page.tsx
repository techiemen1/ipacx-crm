import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PropertyManagement } from "@/components/admin/property-management"

export default async function PropertiesPage() {
    const session = await auth()
    if (!session) return null

    // Fetch properties with project relation
    const properties = await prisma.property.findMany({
        include: { project: true },
        orderBy: { createdAt: 'desc' }
    })

    const projects = await prisma.project.findMany({
        select: { id: true, name: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                <p className="text-muted-foreground">Manage your real estate units (Flats, Villas, Plots).</p>
            </div>

            {/* If no projects exist, show warning */}
            {projects.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md text-sm">
                    You need to create a Project first before adding units.
                </div>
            )}

            <PropertyManagement initialProperties={properties} projects={projects} />
        </div>
    )
}
