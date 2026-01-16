"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import type { TaskClient } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskForm } from "./task-form"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tasks: TaskClient[]
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskClient | null>(null)
  const { toast } = useToast()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)
  const startDate = new Date(startOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  const endDate = new Date(endOfMonth)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const { data: tasks, mutate } = useSWR<TaskClient[]>(
    `/api/tasks?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
    fetcher,
  )

  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const current = new Date(startDate)
    while (current <= endDate) {
      const dayTasks = (tasks || []).filter((task) => {
        const taskDate = new Date(task.dueDate)
        return (
          taskDate.getDate() === current.getDate() &&
          taskDate.getMonth() === current.getMonth() &&
          taskDate.getFullYear() === current.getFullYear()
        )
      })

      const dateForComparison = new Date(current)
      dateForComparison.setHours(0, 0, 0, 0)

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: dateForComparison.getTime() === today.getTime(),
        tasks: dayTasks,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [tasks, month, startDate, endDate])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const handleEditTask = (task: TaskClient) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleSubmit = async (data: Partial<TaskClient>) => {
    try {
      const isEdit = !!data._id
      const url = isEdit ? `/api/tasks/${data._id}` : "/api/tasks"
      const method = isEdit ? "PUT" : "POST"

      // If we have a selected date and this is a new task, use that date
      if (!isEdit && selectedDate) {
        data.dueDate = selectedDate.toISOString()
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Failed to save task")

      toast({
        title: isEdit ? "Task updated!" : "Task created!",
      })

      mutate()
      setEditingTask(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      })
    }
  }

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completed" }),
      })

      if (!res.ok) throw new Error("Failed to complete task")

      toast({ title: "Task completed!" })
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    }
  }

  const selectedDayTasks = selectedDate
    ? calendarDays.find(
        (d) =>
          d.date.getDate() === selectedDate.getDate() &&
          d.date.getMonth() === selectedDate.getMonth() &&
          d.date.getFullYear() === selectedDate.getFullYear(),
      )?.tasks || []
    : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {DAYS.map((day) => (
                <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-background p-2 min-h-[100px] cursor-pointer transition-colors hover:bg-muted/50",
                    !day.isCurrentMonth && "bg-muted/30",
                    day.isToday && "ring-2 ring-primary ring-inset",
                    selectedDate &&
                      day.date.getDate() === selectedDate.getDate() &&
                      day.date.getMonth() === selectedDate.getMonth() &&
                      "bg-primary/10",
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      !day.isCurrentMonth && "text-muted-foreground",
                      day.isToday && "text-primary",
                    )}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task._id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          task.status === "completed"
                            ? "bg-green-100 text-green-800 line-through"
                            : task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </div>
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground">+{day.tasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })
                  : "Select a day"}
              </CardTitle>
              {selectedDate && (
                <Button size="sm" onClick={handleAddTask}>
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-sm">Click on a day to view tasks</p>
            ) : selectedDayTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks for this day</p>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map((task) => (
                  <div
                    key={task._id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                      task.status === "completed" && "opacity-60",
                    )}
                    onClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium text-sm truncate",
                              task.status === "completed" && "line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          {task.isRecurring && <Repeat className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs mt-1",
                            task.priority === "high"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : task.priority === "medium"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-green-100 text-green-800 border-green-200",
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleComplete(task._id)
                          }}
                        >
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleSubmit}
        initialData={
          editingTask || (selectedDate ? ({ dueDate: selectedDate.toISOString() } as TaskClient) : undefined)
        }
      />
    </div>
  )
}
