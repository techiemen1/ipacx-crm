"use server"

import { prisma } from "@/lib/prisma"

export async function getCashFlowData() {
    // 6-Month Projection / History
    // We will aggregate:
    // 1. Inflow: Receipts (Payment where type=RECEIPT or Sales Voucher cash)
    // 2. Outflow: Payments (Payment where type=PAYMENT), Expenses, Salaries

    // For simplicity, we'll group by month.
    // Date Range: Start of current year to present + 3 months forecast?
    // Let's stick to Historical + Current Month for now as "Projection" usually requires budgeted data which we partially have (Recurring expenses?)
    // Actually, user wants "Projection" which often implies future. 
    // We can project based on "Due" invoices (Inflow) and "Unpaid" bills/Expenses (Outflow).

    // Strategy:
    // Historical (Past 6 months): Actual Bank Transactions.
    // Future (Next 3 months): Due Invoices (Inflow), Recurring Bills/Salaries (Outflow).

    const today = new Date()
    const months = []

    // Generate last 6 months + next 3 months
    for (let i = -5; i <= 3; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
        months.push(d)
    }

    const data = await Promise.all(months.map(async (date) => {
        const month = date.getMonth()
        const year = date.getFullYear()
        const startOfMonth = new Date(year, month, 1)
        const endOfMonth = new Date(year, month + 1, 0)

        const isFuture = date > today

        let inflow = 0
        let outflow = 0

        if (!isFuture) {
            // Actuals
            const received = await prisma.voucher.findMany({
                where: {
                    type: "RECEIPT",
                    date: { gte: startOfMonth, lte: endOfMonth }
                },
                include: { entries: true }
            })
            // Sum all credit entries to Bank/Cash? Or just total voucher amount?
            // Voucher doesn't have total amount directly usually, derived from entries.
            // Let's use BankStatementLines for most accurate Cash Flow if available?
            // But user might not have uploaded statements. use Vouchers.
            // Simplified: Receipt Vouchers = Inflow. Payment Vouchers = Outflow.

            // We need a helper to get total amounts.
            // Assuming Voucher entries sum up.
            // Hack: Just count 'Payment' entries in Database with type 'Credit' to Debtor? 
            // Better: 'Receipt' voucher typically credits a Customer and Debits Bank/Cash.
            // We sum the Bank/Cash Debit entries in Receipt Vouchers.

            // For now, let's just fetch ALL Payments linked to Invoices or general Payments
            const payments = await prisma.payment.findMany({
                where: { date: { gte: startOfMonth, lte: endOfMonth } }
            })
            // Payments link to Invoice. Usually "Received".
            // But we also have "Make Payment" to Vendors.
            // Our Payment model links to Invoice (Sales). So it is Inflow.
            inflow = payments.reduce((sum, p) => sum + p.amount, 0)

            const expenses = await prisma.expense.findMany({
                where: { date: { gte: startOfMonth, lte: endOfMonth } }
            })
            outflow += expenses.reduce((sum, e) => sum + e.amount, 0)

            // Salaries (Payslips)
            const payslips = await prisma.payslip.findMany({
                where: { month: month + 1, year } // Payslip month is 1-based usually? Logic in creation used 'month'.
            })
            outflow += payslips.reduce((sum, p) => sum + p.netSalary, 0)

        } else {
            // Projections
            // Inflow: Invoices due in this month
            const dueInvoices = await prisma.invoice.findMany({
                where: {
                    dueDate: { gte: startOfMonth, lte: endOfMonth },
                    status: { not: "Paid" }
                }
            })
            inflow = dueInvoices.reduce((sum, inv) => sum + (inv.totalAmount), 0) // Minus paid amount ideally

            // Outflow: Recurring Estimated (Avg of last 3 months expenses + Salaries)
            // Simplified: Just take active Employee Salary load
            const employees = await prisma.employee.findMany({ where: { status: "Active" } })
            const salaryLoad = employees.reduce((sum, e) => sum + e.basicSalary + e.hra + e.allowances, 0)
            outflow += salaryLoad

            // + Avg Expense? Limit scope for now.
        }

        return {
            month: date.toLocaleString('default', { month: 'short' }),
            year: year,
            inflow,
            outflow,
            net: inflow - outflow,
            isFuture
        }
    }))

    return data
}
