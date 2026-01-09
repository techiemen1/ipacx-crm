import { getBankAccounts } from "@/lib/banking-actions"
import { BankDashboard } from "@/components/admin/bank-dashboard"

export default async function Page() {
    const accounts = await getBankAccounts()
    return <BankDashboard initialAccounts={accounts} />
}
