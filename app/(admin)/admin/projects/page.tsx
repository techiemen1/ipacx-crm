import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProjectManagement } from "@/components/admin/project-management"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session) return null

    // Fetch projects with property count
    const projects = await prisma.project.findMany({
        include: {
            properties: {
                select: { id: true } // Just fetch IDs to count
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">Manage your detailed project portfolio.</p>
            </div>

            <ProjectManagement initialProjects={projects} />
        </div>
    )
}
