"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { TaskClient, DashboardStats } from "@/lib/types"
import { StatCard } from "./stat-card"
import { TaskList } from "./task-list"
import { TaskForm } from "./task-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CalendarCheck, CalendarDays, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("today")
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskClient | null>(null)
  const { toast } = useToast()

  const { data: stats, mutate: mutateStats } = useSWR<DashboardStats>("/api/stats", fetcher)
  const { data: todayTasks, mutate: mutateTodayTasks } = useSWR<TaskClient[]>("/api/tasks?view=today", fetcher)
  const { data: weekTasks, mutate: mutateWeekTasks } = useSWR<TaskClient[]>("/api/tasks?view=week", fetcher)
  const { data: backlogTasks, mutate: mutateBacklogTasks } = useSWR<TaskClient[]>("/api/tasks?view=backlog", fetcher)

  const mutateAll = useCallback(() => {
    mutateStats()
    mutateTodayTasks()
    mutateWeekTasks()
    mutateBacklogTasks()
  }, [mutateStats, mutateTodayTasks, mutateWeekTasks, mutateBacklogTasks])

  const handleComplete = async (id: string, action: "completed" | "skipped" | "deferred") => {
    try {
      const body: Record<string, unknown> = { action }

      if (action === "deferred") {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        body.newDueDate = tomorrow.toISOString()
      }

      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to update task")

      toast({
        title: action === "completed" ? "Task completed!" : action === "deferred" ? "Task deferred" : "Task skipped",
      })

      mutateAll()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: Partial<TaskClient>) => {
    try {
      const isEdit = !!data._id
      const url = isEdit ? `/api/tasks/${data._id}` : "/api/tasks"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Failed to save task")

      toast({
        title: isEdit ? "Task updated!" : "Task created!",
      })

      mutateAll()
      setEditingTask(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete task")

      toast({ title: "Task deleted" })
      mutateAll()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (task: TaskClient) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <StatCard
          title="Today"
          value={stats?.todayCount || 0}
          icon={CalendarCheck}
          onClick={() => setActiveTab("today")}
        />
        <StatCard
          title="This Week"
          value={stats?.weekCount || 0}
          icon={CalendarDays}
          onClick={() => setActiveTab("week")}
        />
        <StatCard
          title="Backlog"
          value={stats?.backlogCount || 0}
          icon={AlertTriangle}
          variant={stats?.backlogCount ? "warning" : "default"}
          onClick={() => setActiveTab("backlog")}
        />
        <StatCard
          title="Completed"
          value={stats?.completedToday || 0}
          icon={CheckCircle}
          variant={stats?.completedToday ? "success" : "default"}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="today" className="flex-1 sm:flex-none">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="flex-1 sm:flex-none">
            This Week
          </TabsTrigger>
          <TabsTrigger value="backlog" className="flex-1 sm:flex-none">
            Backlog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TaskList
            tasks={todayTasks || []}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No tasks for today. Enjoy your day!"
          />
        </TabsContent>

        <TabsContent value="week">
          <TaskList
            tasks={weekTasks || []}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No tasks scheduled for this week"
          />
        </TabsContent>

        <TabsContent value="backlog">
          <TaskList
            tasks={backlogTasks || []}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No overdue tasks. Great job!"
          />
        </TabsContent>
      </Tabs>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingTask}
      />
    </div>
  )
}
