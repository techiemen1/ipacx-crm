"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Calendar, DollarSign } from "lucide-react"
import { updateDealStage } from "@/lib/crm-actions"
import { toast } from "sonner"
import { ContactActions } from "@/components/admin/contact-actions"
// import { DealDialog } from "./deal-dialog" // Will create next

interface Stage {
    id: string
    name: string
    color: string | null
    // deals are passed separately
}

interface Pipeline {
    id: string
    name: string
    stages: Stage[]
}

export default function CRMKanbanBoard({ pipeline, deals }: { pipeline: Pipeline, deals: any[] }) {
    // Group deals by stage
    const [columns, setColumns] = useState<any>(pipeline.stages.map(stage => ({
        ...stage,
        items: deals.filter(d => d.stageId === stage.id)
    })))

    useEffect(() => {
        setColumns(pipeline.stages.map(stage => ({
            ...stage,
            items: deals.filter(d => d.stageId === stage.id)
        })))
    }, [deals, pipeline])

    const onDragEnd = async (result: any) => {
        if (!result.destination) return
        const { source, destination } = result

        if (source.droppableId !== destination.droppableId) {
            const sourceColIndex = columns.findIndex((col: any) => col.id === source.droppableId)
            const destColIndex = columns.findIndex((col: any) => col.id === destination.droppableId)

            const sourceCol = columns[sourceColIndex]
            const destCol = columns[destColIndex]

            const sourceItems = [...sourceCol.items]
            const destItems = [...destCol.items]

            const [removed] = sourceItems.splice(source.index, 1)
            destItems.splice(destination.index, 0, { ...removed, stageId: destCol.id }) // optimistically update stageId

            const newColumns = [...columns]
            newColumns[sourceColIndex] = { ...sourceCol, items: sourceItems }
            newColumns[destColIndex] = { ...destCol, items: destItems }

            setColumns(newColumns)

            // Server Update
            const res = await updateDealStage(removed.id, destCol.id)
            if (res.error) {
                toast.error("Failed to move deal")
                // Revert? (Complex, for now assume success or refresh)
            }
        } else {
            // Reordering within same column (not persisted yet)
        }
    }

    return (
        <div className="h-full overflow-x-auto pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full min-w-max">
                    {columns.map((column: any) => (
                        <div key={column.id} className="w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-lg p-2">
                            <div className="flex items-center justify-between p-2 mb-2 font-semibold">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || '#ccc' }} />
                                    {column.name}
                                    <Badge variant="secondary" className="ml-1 text-xs">{column.items.length}</Badge>
                                </div>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 flex flex-col gap-2 min-h-[100px]"
                                    >
                                        {column.items.map((deal: any, index: number) => (
                                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                                            <CardContent className="p-3 space-y-2">
                                                                <div className="font-medium text-sm line-clamp-2">{deal.title}</div>
                                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <DollarSign className="w-3 h-3" />
                                                                        {deal.value.toLocaleString()}
                                                                    </div>
                                                                    {deal.customer && (
                                                                        <div className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                                                            {deal.customer.firstName || deal.customer.name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {deal.expectedCloseDate && (
                                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                                    </div>
                                                                )}

                                                                {deal.customer && (
                                                                    <div className="pt-2 border-t mt-2 flex justify-end">
                                                                        <ContactActions
                                                                            phone={deal.customer.phone}
                                                                            email={deal.customer.email}
                                                                            className="scale-90 origin-right"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))
                    }
                </div >
            </DragDropContext >
        </div >
    )
}
