"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown, Calendar } from "lucide-react"

interface StockNotificationsProps {
    lowStockItems: any[]
    expiringBatches: any[]
}

export function StockNotifications({ lowStockItems, expiringBatches }: StockNotificationsProps) {
    if (lowStockItems.length === 0 && expiringBatches.length === 0) return null

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {lowStockItems.length > 0 && (
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" /> Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="space-y-2">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0 border-red-100">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-red-600">{item.currentStock} {item.unit}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {expiringBatches.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Expiry Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="space-y-2">
                            {expiringBatches.map((batch) => (
                                <div key={batch.id} className="flex justify-between text-sm py-1 border-b last:border-0 border-amber-100">
                                    <span className="truncate max-w-[150px]">{batch.item.name} ({batch.batchNo})</span>
                                    <span className="font-medium text-amber-500">
                                        {new Date(batch.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
