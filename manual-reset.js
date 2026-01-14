
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetApplicationData() {
    try {
        await prisma.$transaction(async (tx) => {
            // SQLite "Nuclear" Reset - Bypass FKs on THIS transaction connection
            // @ts-ignore
            await tx.$executeRawUnsafe("PRAGMA foreign_keys = OFF;")
            console.log("Reset: Cleaning Data...")

            // Core Business Data
            // @ts-ignore
            await tx.billAllocation.deleteMany()
            // @ts-ignore
            await tx.voucherEntry.deleteMany()
            // @ts-ignore
            await tx.voucher.deleteMany()
            // @ts-ignore
            await tx.stockMovement.deleteMany()
            // @ts-ignore
            await tx.stockJournal.deleteMany()
            // @ts-ignore
            await tx.inventoryStock.deleteMany()
            // @ts-ignore
            await tx.inventoryBatch.deleteMany()
            // @ts-ignore
            await tx.productionOrder.deleteMany()
            // @ts-ignore
            await tx.bOMComponent.deleteMany()
            // @ts-ignore
            await tx.billOfMaterial.deleteMany()
            // @ts-ignore
            await tx.inventoryItem.deleteMany()

            // Banking
            // @ts-ignore
            await tx.bankStatementLine.deleteMany()
            // @ts-ignore
            await tx.chequeLeaf.deleteMany()
            // @ts-ignore
            await tx.chequeBook.deleteMany()
            // @ts-ignore
            await tx.bankAccount.deleteMany()

            // Sales/Purchases
            // @ts-ignore
            await tx.payment.deleteMany()
            // @ts-ignore
            await tx.invoiceItem.deleteMany()
            // @ts-ignore
            await tx.invoice.deleteMany()
            // @ts-ignore
            await tx.expense.deleteMany()

            // CRM
            // @ts-ignore
            await tx.activity.deleteMany()
            // @ts-ignore
            await tx.cRMContact.deleteMany()
            // @ts-ignore
            await tx.cRMDeal.deleteMany()
            // @ts-ignore
            await tx.cRMStage.deleteMany()
            // @ts-ignore
            await tx.cRMPipeline.deleteMany()

            // HR & Tasks
            // @ts-ignore
            await tx.task.deleteMany()
            // @ts-ignore
            await tx.hRLeaveRequest.deleteMany()
            // @ts-ignore
            await tx.hRLeaveBalance.deleteMany()
            // @ts-ignore
            await tx.attendance.deleteMany()
            // @ts-ignore
            await tx.payslip.deleteMany()
            // @ts-ignore
            await tx.employeePayHead.deleteMany()
            // @ts-ignore
            await tx.employee.deleteMany()

            // HR Config
            // @ts-ignore
            await tx.hRDepartment.deleteMany()
            // @ts-ignore
            await tx.hRDesignation.deleteMany()
            // @ts-ignore
            await tx.hRPayHead.deleteMany()
            // @ts-ignore
            await tx.hRShift.deleteMany()
            // @ts-ignore
            await tx.hRLeaveType.deleteMany()

            // Logs
            // @ts-ignore
            await tx.communicationLog.deleteMany()
            // @ts-ignore
            await tx.internalLog.deleteMany()

            // Master Data
            // @ts-ignore
            await tx.costCenter.deleteMany()
            // @ts-ignore
            await tx.property.deleteMany()
            // @ts-ignore
            await tx.inventoryGroup.deleteMany()
            // @ts-ignore
            await tx.uomConversion.deleteMany()
            // @ts-ignore
            await tx.unitOfMeasure.deleteMany()
            // @ts-ignore
            await tx.warehouse.deleteMany()
            // @ts-ignore
            await tx.vendor.deleteMany()
            // @ts-ignore
            await tx.customer.deleteMany()
            // @ts-ignore
            await tx.project.deleteMany()
            // @ts-ignore
            await tx.companyProfile.deleteMany()
            // @ts-ignore
            await tx.accountHead.deleteMany()
            // @ts-ignore
            await tx.accountGroup.deleteMany()
            // @ts-ignore
            await tx.taxRate.deleteMany()
            // @ts-ignore
            await tx.appConfig.deleteMany()

            // Users & Access Control
            // @ts-ignore
            await tx.userRole.deleteMany()
            // @ts-ignore
            await tx.role.deleteMany()
            // @ts-ignore
            await tx.userProfile.deleteMany()

            // Delete all users except ADMINs
            // @ts-ignore
            await tx.user.deleteMany({
                where: { role: { not: 'ADMIN' } }
            })

            console.log("Reset: Data cleaned.")

            // Re-enable FKs
            // @ts-ignore
            await tx.$executeRawUnsafe("PRAGMA foreign_keys = ON;")
        }, {
            timeout: 30000,
            maxWait: 5000
        })

        console.log("SUCCESS: Manual Reset Completed.")
    } catch (e) {
        console.error("Hard Reset Failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

resetApplicationData()
