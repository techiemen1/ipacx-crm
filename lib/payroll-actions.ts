"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const employeeSchema = z.object({
    code: z.string().min(1, "Code is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    joinDate: z.string(), // YYYY-MM-DD

    // Salary
    basicSalary: z.coerce.number().min(0),
    hra: z.coerce.number().min(0),
    allowances: z.coerce.number().min(0),
    pfDeduction: z.coerce.number().min(0),
    ptDeduction: z.coerce.number().min(0),

    // Bank
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export async function createEmployee(data: EmployeeFormValues) {
    const validated = employeeSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.employee.create({
            data: {
                code: validated.data.code,
                firstName: validated.data.firstName,
                lastName: validated.data.lastName,
                email: validated.data.email || null,
                phone: validated.data.phone,
                designationId: validated.data.designation,
                departmentId: validated.data.department,
                joinDate: new Date(validated.data.joinDate),
                basicSalary: validated.data.basicSalary,
                hra: validated.data.hra,
                allowances: validated.data.allowances,
                pfDeduction: validated.data.pfDeduction,
                ptDeduction: validated.data.ptDeduction,
                bankName: validated.data.bankName,
                accountNumber: validated.data.accountNumber,
                ifsc: validated.data.ifsc
            }
        })
        revalidatePath("/admin/hr/employees")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create employee. Code or Email might be duplicate." }
    }
}

export async function getEmployees() {
    try {
        return await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch {
        return []
    }
}

export async function getEmployee(id: string) {
    try {
        return await prisma.employee.findUnique({
            where: { id }
        })
    } catch {
        return null
    }
}

// --- Attendance ---

export async function markAttendance(data: {
    employeeId: string,
    date: Date,
    status: string,
    checkIn?: Date,
    checkOut?: Date
}) {
    try {
        await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: data.employeeId,
                    date: data.date
                }
            },
            update: {
                status: data.status,
                checkIn: data.checkIn,
                checkOut: data.checkOut
            },
            create: {
                employeeId: data.employeeId,
                date: data.date,
                status: data.status,
                checkIn: data.checkIn,
                checkOut: data.checkOut
            }
        })
        revalidatePath("/admin/hr/attendance")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to mark attendance" }
    }
}

export async function getAttendanceSheet(date: Date) {
    try {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const employees = await prisma.employee.findMany({
            where: { status: "Active" },
            orderBy: { firstName: 'asc' },
            include: {
                attendance: {
                    where: {
                        date: {
                            equals: startOfDay
                        }
                    }
                }
            }
        })
        return employees
    } catch {
        return []
    }
}

// --- Payroll Processing ---

export async function generatePayslips(month: number, year: number) {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: "Active" }
        })

        if (!employees.length) return { error: "No active employees found" }

        // Check if already generated
        const existing = await prisma.payslip.findFirst({
            where: { month, year }
        })
        if (existing) return { error: "Payslips already generated for this period" }

        const slips = employees.map(emp => {
            const earnings = emp.basicSalary + emp.hra + emp.allowances
            const deductions = emp.pfDeduction + emp.ptDeduction
            const net = earnings - deductions

            return {
                employeeId: emp.id,
                month,
                year,
                basic: emp.basicSalary,
                hra: emp.hra,
                allowances: emp.allowances,
                bonus: 0,
                pf: emp.pfDeduction,
                pt: emp.ptDeduction,
                tds: 0,
                netSalary: net,
                status: "Draft"
            }
        })

        for (const slip of slips) {
            await prisma.payslip.create({ data: slip })
        }

        revalidatePath("/admin/accounts/payroll")
        return { success: true, count: slips.length }
    } catch (e) {
        console.error(e)
        return { error: "Failed to generate payslips" }
    }
}

export async function getPayrollSummary(month: number, year: number) {
    try {
        const slips = await prisma.payslip.findMany({
            where: { month, year },
            include: { employee: true }
        })
        return slips
    } catch {
        return []
    }
}
