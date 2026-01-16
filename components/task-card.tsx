"use client"

import type { TaskClient, TaskPriority } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, Clock, SkipForward, MoreVertical, Pencil, Trash2, Repeat } from "lucide-react"
import { formatDate, isOverdue } from "@/lib/task-utils"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: TaskClient
  onComplete: (id: string, action: "completed" | "skipped" | "deferred") => void
  onEdit: (task: TaskClient) => void
  onDelete: (id: string) => void
}

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const overdue = isOverdue(new Date(task.dueDate)) && task.status === "pending"

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        overdue && "border-red-300 bg-red-50/50",
        task.status === "completed" && "opacity-60",
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "font-medium truncate text-sm sm:text-base",
                  task.status === "completed" && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              {task.isRecurring && <Repeat className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            </div>

            {task.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              <span className={cn("text-xs", overdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
                {overdue ? "Overdue: " : ""}
                {formatDate(task.dueDate)}
              </span>
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs hidden sm:inline-flex">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {task.status === "pending" && (
              <>
                {/* Desktop: Show all action buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onComplete(task._id, "completed")}
                    title="Mark complete"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => onComplete(task._id, "deferred")}
                    title="Defer to tomorrow"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onComplete(task._id, "skipped")}
                    title="Skip"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile: Quick complete button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="sm:hidden h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => onComplete(task._id, "completed")}
                  title="Mark complete"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.status === "pending" && (
                  <>
                    <DropdownMenuItem className="sm:hidden" onClick={() => onComplete(task._id, "deferred")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Defer to tomorrow
                    </DropdownMenuItem>
                    <DropdownMenuItem className="sm:hidden" onClick={() => onComplete(task._id, "skipped")}>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(task._id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
