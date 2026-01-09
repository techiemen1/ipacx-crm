import { getBankAccounts, getChequeBooks } from "@/lib/banking-actions"
import { ChequeManagement, ChequeBookList } from "@/components/admin/cheque-management"

export default async function Page({ searchParams }: { searchParams: { accountId?: string } }) {
    const accounts = await getBankAccounts()
    const accountId = searchParams.accountId || accounts[0]?.id

    const books = accountId ? await getChequeBooks(accountId) : []

    return (
        <div className="space-y-6">
            <ChequeManagement accounts={accounts} />
            <ChequeBookList books={books} />
        </div>
    )
}
