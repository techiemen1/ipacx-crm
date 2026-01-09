"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LayoutGrid, List } from "lucide-react"
import CRMKanbanBoard from "./crm-board"
import { CRMList } from "./crm-list"

interface CRMViewProps {
    pipeline: any
    deals: any[]
}

export function CRMView({ pipeline, deals }: CRMViewProps) {
    const [view, setView] = useState("board")

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-end">
                <Tabs value={view} onValueChange={setView} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="board">
                            <LayoutGrid className="w-4 h-4 mr-2" /> Board
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            <List className="w-4 h-4 mr-2" /> List
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden h-full">
                {view === 'board' ? (
                    <CRMKanbanBoard pipeline={pipeline} deals={deals} />
                ) : (
                    <div className="h-full overflow-y-auto">
                        <CRMList deals={deals} />
                    </div>
                )}
            </div>
        </div>
    )
}
