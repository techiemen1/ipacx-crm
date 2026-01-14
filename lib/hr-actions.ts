'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Master Data Management ---

export async function getDepartments() {
    try {
        const data = await prisma.hRDepartment.findMany({ orderBy: { name: 'asc' } })
        return { data }
    } catch (e) {
        return { error: "Failed to fetch departments" }
    }
}

export async function createDepartment(name: string, parentId?: string) {
    try {
        await prisma.hRDepartment.create({
            data: { name, parentId }
        })
        revalidatePath("/admin/hr", "layout")
        revalidatePath("/admin/hr/employees/new")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create department" }
    }
}

export async function deleteDepartment(id: string) {
    try {
        await prisma.hRDepartment.delete({ where: { id } })
        revalidatePath("/admin/hr", "layout")
        revalidatePath("/admin/hr/employees/new")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete department (it may be in use)" }
    }
}

export async function createDesignation(name: string) {
    try {
        await prisma.hRDesignation.create({
            data: { name }
        })
        revalidatePath("/admin/hr", "layout")
        revalidatePath("/admin/hr/employees/new")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create designation" }
    }
}

export async function deleteDesignation(id: string) {
    try {
        await prisma.hRDesignation.delete({ where: { id } })
        revalidatePath("/admin/hr", "layout")
        revalidatePath("/admin/hr/employees/new")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete designation (it may be in use)" }
    }
}

export async function createShift(data: { name: string, startTime: string, endTime: string }) {
    try {
        const existing = await prisma.hRShift.findUnique({
            where: { name: data.name }
        })

        if (existing) {
            return { error: "Shift with this name already exists" }
        }

        await prisma.hRShift.create({ data })
        revalidatePath("/admin/hr", "layout")
        revalidatePath("/admin/hr/employees/new")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create shift" }
    }
}

// --- Pay Head Configuration ---

export async function createPayHead(data: {
    name: string, type: string, calculationType: string, isStatutory?: boolean, commonAmount?: number
}) {
    try {
        await prisma.hRPayHead.create({ data })
        revalidatePath("/admin/hr/payroll/setup")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create pay head" }
    }
}

// --- Employee Management ---

export async function createEmployee(data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    departmentId?: string
    designationId?: string
    shiftId?: string
    joinDate: Date
    // Statutory
    pan?: string
    aadhar?: string
    uan?: string
    pfNumber?: string
    esiNumber?: string
    // Bank
    bankName?: string
    accountNumber?: string
    ifsc?: string
    // Salary Structure
    salaryStructure?: { payHeadId: string, amount: number }[]
}) {
    try {
        // Generate distinct Code
        const count = await prisma.employee.count()
        const code = `EMP${(count + 1).toString().padStart(3, '0')}`

        await prisma.$transaction(async (tx) => {
            const emp = await tx.employee.create({
                data: {
                    code,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    departmentId: data.departmentId || null,
                    designationId: data.designationId || null,
                    shiftId: data.shiftId || null,
                    joinDate: data.joinDate,
                    pan: data.pan,
                    aadhar: data.aadhar,
                    uan: data.uan,
                    pfNumber: data.pfNumber,
                    esiNumber: data.esiNumber,
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    ifsc: data.ifsc
                }
            })

            // Link Salary Structure
            if (data.salaryStructure && data.salaryStructure.length > 0) {
                for (const s of data.salaryStructure) {
                    await tx.employeePayHead.create({
                        data: {
                            employeeId: emp.id,
                            payHeadId: s.payHeadId,
                            amount: s.amount
                        }
                    })
                }

                // Update Legacy Fields for compatibility till UI migration is full
                // This is a rough mapping for immediate dashboard compatibility
                // In future, dashboard should aggregate EmployeePayHead
                let basic = 0, hra = 0, allowances = 0

                // Fetch PayHeads names to map
                // For now, simpler to just store structure. 
                // We'll skip legacy update for now as it's complex to map cleanly without lookup
            }
        })

        revalidatePath("/admin/hr")
        revalidatePath("/admin/hr/employees")
        return { success: true }
    } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create employee" }
    }
}

export async function updateEmployee(id: string, data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    departmentId?: string
    designationId?: string
    shiftId?: string
    joinDate: Date
    pan?: string
    aadhar?: string
    uan?: string
    pfNumber?: string
    esiNumber?: string
    bankName?: string
    accountNumber?: string
    ifsc?: string
}) {
    try {
        await prisma.employee.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                departmentId: data.departmentId || null,
                designationId: data.designationId || null,
                shiftId: data.shiftId || null,
                joinDate: data.joinDate,
                pan: data.pan,
                aadhar: data.aadhar,
                uan: data.uan,
                pfNumber: data.pfNumber,
                esiNumber: data.esiNumber,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                ifsc: data.ifsc
            }
        })
        revalidatePath("/admin/hr")
        revalidatePath("/admin/hr/employees")
        return { success: true }
    } catch (e) {
        return { error: "Failed to update employee" }
    }
}

export async function deleteEmployee(id: string) {
    try {
        await prisma.employee.delete({ where: { id } })
        revalidatePath("/admin/hr")
        revalidatePath("/admin/hr/employees")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete employee" }
    }
}

export async function getEmployee(id: string) {
    try {
        const emp = await prisma.employee.findUnique({
            where: { id },
            include: { department: true, designation: true }
        })
        return { data: emp }
    } catch (e) {
        return { error: "Employee not found" }
    }
}

export async function getEmployees() {
    try {
        const emps = await prisma.employee.findMany({
            include: {
                department: true,
                designation: true,
                shift: true
            },
            orderBy: { firstName: 'asc' }
        })
        return { data: emps }
    } catch (e) {
        return { error: "Failed to fetch employees" }
    }
}

// --- Leave Management ---

export async function createLeaveType(data: { name: string, daysAllowed: number, carryForwardMax: number }) {
    try {
        await prisma.hRLeaveType.create({ data })
        revalidatePath("/admin/hr")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create leave type" }
    }
}

export async function createLeaveRequest(data: {
    employeeId: string, leaveTypeId: string, startDate: Date, endDate: Date, reason?: string
}) {
    try {
        // Simple day calc
        const diff = data.endDate.getTime() - data.startDate.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1

        await prisma.hRLeaveRequest.create({
            data: { ...data, days, status: "PENDING" }
        })
        revalidatePath("/admin/hr")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create leave request" }
    }
}

export async function updateLeaveRequestStatus(id: string, status: string) {
    try {
        await prisma.hRLeaveRequest.update({
            where: { id },
            data: { status }
        })
        // TODO: Logic to deduct balance if approved
        revalidatePath("/admin/hr")
        return { success: true }
    } catch (e) {
        return { error: "Failed to update request" }
    }
}

// --- Payroll Processing ---

export async function generatePayslips(month: number, year: number) {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: "Active" },
            include: { salaryStructure: { include: { payHead: true } } }
        })

        if (!employees.length) return { error: "No active employees found" }

        // Check for existing
        const existing = await prisma.payslip.findFirst({
            where: { month, year }
        })
        if (existing) return { error: "Payslips already generated for this period" }

        const slips = []

        for (const emp of employees) {
            let earnings = 0
            let deductions = 0
            let basic = 0, hra = 0, pf = 0, pt = 0

            // Calculate totals from dynamic heads
            if (emp.salaryStructure.length > 0) {
                for (const item of emp.salaryStructure) {
                    if (item.payHead.type === 'EARNING') earnings += item.amount
                    else if (item.payHead.type === 'DEDUCTION') deductions += item.amount

                    // Map specific heads for payslip display (approximate matching by name)
                    const name = item.payHead.name.toLowerCase()
                    if (name.includes('basic')) basic = item.amount
                    else if (name.includes('hra')) hra = item.amount
                    else if (name.includes('pf') || name.includes('provident')) pf = item.amount
                    else if (name.includes('pt') || name.includes('professional')) pt = item.amount
                }
            } else {
                // Fallback to legacy fields if structure is empty
                earnings = emp.basicSalary + emp.hra + emp.allowances
                deductions = emp.pfDeduction + emp.ptDeduction
                basic = emp.basicSalary
                hra = emp.hra
                pf = emp.pfDeduction
                pt = emp.ptDeduction
            }

            slips.push({
                employeeId: emp.id,
                month,
                year,
                basic,
                hra,
                allowances: earnings - (basic + hra), // Remaining earnings as allowances
                bonus: 0,
                pf,
                pt,
                tds: 0,
                netSalary: earnings - deductions,
                status: "Draft"
            })
        }

        for (const slip of slips) {
            await prisma.payslip.create({ data: slip })
        }

        revalidatePath("/admin/accounts/payroll")
        return { success: true, count: slips.length }
    } catch (e) {
        return { error: "Failed to generate payslips" }
    }
}

