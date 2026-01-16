"use client"

import type { TaskClient } from "@/lib/types"
import { TaskCard } from "./task-card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TaskListProps {
  tasks: TaskClient[]
  onComplete: (id: string, action: "completed" | "skipped" | "deferred") => void
  onEdit: (task: TaskClient) => void
  onDelete: (id: string) => void
  emptyMessage?: string
}

export function TaskList({ tasks, onComplete, onEdit, onDelete, emptyMessage = "No tasks" }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">{emptyMessage}</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)] sm:h-[calc(100vh-280px)]">
      <div className="space-y-2 sm:space-y-3 pr-4">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onComplete={onComplete} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </ScrollArea>
  )
}
