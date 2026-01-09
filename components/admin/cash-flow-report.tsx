"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react"

interface CashFlowData {
    month: string
    year: number
    inflow: number
    outflow: number
    net: number
    isFuture: boolean
}

export function CashFlowReport({ data }: { data: CashFlowData[] }) {
    const maxVal = Math.max(...data.map(d => Math.max(d.inflow, d.outflow))) || 1000

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Proj. Inflow (Next 3M)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {data.filter(d => d.isFuture).reduce((sum, d) => sum + d.inflow, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Proj. Outflow (Next 3M)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {data.filter(d => d.isFuture).reduce((sum, d) => sum + d.outflow, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {data.filter(d => d.isFuture).reduce((sum, d) => sum + d.net, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Cash Flow Trend</CardTitle>
                    <CardDescription>Historical performance vs Projected capability</CardDescription>
                </CardHeader>
                <div className="mt-8">
                    <div className="flex items-end justify-between h-[300px] gap-2">
                        {data.map((item, idx) => {
                            const inflowH = (item.inflow / maxVal) * 100
                            const outflowH = (item.outflow / maxVal) * 100

                            return (
                                <div key={idx} className="flex flex-col items-center flex-1 gap-2 group relative">
                                    <div className="flex gap-1 items-end h-full w-full justify-center px-1">
                                        {/* Inflow Bar */}
                                        <div
                                            className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 ${item.isFuture ? 'bg-green-300 pattern-diagonal-lines' : 'bg-green-500'}`}
                                            style={{ height: `${inflowH}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-0 right-0 text-center bg-black text-white text-xs py-1 rounded pointer-events-none z-10">
                                                In: {item.inflow.toLocaleString()}
                                                <br />
                                                Out: {item.outflow.toLocaleString()}
                                            </div>
                                        </div>
                                        {/* Outflow Bar */}
                                        <div
                                            className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 ${item.isFuture ? 'bg-red-300' : 'bg-red-500'}`}
                                            style={{ height: `${outflowH}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium text-center">
                                        {item.month}
                                        {item.isFuture && <span className="block text-[10px] text-blue-500">(Est)</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${item.net >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {item.net >= 0 ? <ArrowUpCircle className="h-5 w-5 text-green-600" /> : <ArrowDownCircle className="h-5 w-5 text-red-600" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.month} {item.year} {item.isFuture && "(Projected)"}</p>
                                        <p className="text-sm text-muted-foreground">In: {item.inflow.toLocaleString()} • Out: {item.outflow.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.net > 0 ? "+" : ""}{item.net.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
