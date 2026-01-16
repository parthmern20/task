"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { TaskClient, TaskPriority, RecurrencePattern } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<TaskClient>) => void
  initialData?: TaskClient | null
}

export function TaskForm({ open, onClose, onSubmit, initialData }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("none")
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [tags, setTags] = useState("")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || "")
      setDueDate(initialData.dueDate.split("T")[0])
      setPriority(initialData.priority)
      setIsRecurring(initialData.isRecurring)
      setRecurrencePattern(initialData.recurrencePattern)
      setRecurrenceInterval(initialData.recurrenceInterval || 1)
      setTags(initialData.tags?.join(", ") || "")
    } else {
      resetForm()
    }
  }, [initialData, open])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDueDate(new Date().toISOString().split("T")[0])
    setPriority("medium")
    setIsRecurring(false)
    setRecurrencePattern("none")
    setRecurrenceInterval(1)
    setTags("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData: Partial<TaskClient> = {
      title,
      description: description || undefined,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : "none",
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    if (initialData) {
      taskData._id = initialData._id
    }

    onSubmit(taskData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Recurring Task</Label>
            <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Pattern</Label>
                <Select value={recurrencePattern} onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Every</Label>
                <Input
                  type="number"
                  min={1}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, urgent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add"} Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
