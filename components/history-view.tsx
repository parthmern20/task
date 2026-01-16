"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, PlusCircle, Pencil, Trash2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface HistoryEntry {
  _id: string
  taskId: string
  taskTitle: string
  action: "completed" | "skipped" | "deferred" | "created" | "updated" | "deleted"
  timestamp: string
  notes?: string
}

const actionConfig = {
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Completed" },
  skipped: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-100", label: "Skipped" },
  deferred: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Deferred" },
  created: { icon: PlusCircle, color: "text-blue-600", bg: "bg-blue-100", label: "Created" },
  updated: { icon: Pencil, color: "text-purple-600", bg: "bg-purple-100", label: "Updated" },
  deleted: { icon: Trash2, color: "text-red-600", bg: "bg-red-100", label: "Deleted" },
}

export function HistoryView() {
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0])

  const queryParams = new URLSearchParams({
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate + "T23:59:59").toISOString(),
    limit: "100",
  })

  if (actionFilter !== "all") {
    queryParams.set("action", actionFilter)
  }

  const { data: history } = useSWR<HistoryEntry[]>(`/api/history?${queryParams.toString()}`, fetcher)

  const stats = useMemo(() => {
    if (!history) return { completed: 0, skipped: 0, deferred: 0, total: 0 }

    return {
      completed: history.filter((h) => h.action === "completed").length,
      skipped: history.filter((h) => h.action === "skipped").length,
      deferred: history.filter((h) => h.action === "deferred").length,
      total: history.length,
    }
  }, [history])

  const groupedHistory = useMemo(() => {
    if (!history) return {}

    const groups: Record<string, HistoryEntry[]> = {}
    history.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(entry)
    })

    return groups
  }, [history])

  const exportHistory = () => {
    if (!history) return

    const csv = [
      ["Date", "Task", "Action", "Notes"],
      ...history.map((h) => [new Date(h.timestamp).toLocaleString(), h.taskTitle, h.action, h.notes || ""]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `task-history-${startDate}-to-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Task History</h1>
        <Button variant="outline" size="sm" onClick={exportHistory} className="w-full sm:w-auto bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Skipped</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-600">{stats.skipped}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Deferred</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.deferred}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {!history || history.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm py-8">No history entries for the selected period</p>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(groupedHistory).map(([date, entries]) => (
                <div key={date}>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">{date}</h3>
                  <div className="space-y-2">
                    {entries.map((entry) => {
                      const config = actionConfig[entry.action]
                      const Icon = config.icon
                      return (
                        <div key={entry._id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                          <div className={cn("p-1.5 sm:p-2 rounded-full flex-shrink-0", config.bg)}>
                            <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{entry.taskTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {entry.notes && <span className="hidden sm:inline"> - {entry.notes}</span>}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs flex-shrink-0", config.bg, config.color, "border-transparent")}
                          >
                            <span className="hidden sm:inline">{config.label}</span>
                            <Icon className="h-3 w-3 sm:hidden" />
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
