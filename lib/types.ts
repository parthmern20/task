import type { ObjectId } from "mongodb"

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly" | "none"
export type TaskStatus = "pending" | "completed" | "skipped" | "deferred"
export type TaskPriority = "high" | "medium" | "low"

export interface Task {
  _id?: ObjectId
  title: string
  description?: string
  dueDate: Date
  priority: TaskPriority
  status: TaskStatus
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
  recurrenceInterval?: number // e.g., every 2 weeks
  recurrenceEndDate?: Date
  parentTaskId?: ObjectId // for recurring task instances
  tags?: string[]
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TaskHistory {
  _id?: ObjectId
  taskId: ObjectId
  taskTitle: string
  action: "completed" | "skipped" | "deferred" | "created" | "updated" | "deleted"
  timestamp: Date
  notes?: string
}

export interface DashboardStats {
  todayCount: number
  weekCount: number
  backlogCount: number
  completedToday: number
}

// Client-side types (with string IDs)
export interface TaskClient {
  _id: string
  title: string
  description?: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
  recurrenceInterval?: number
  recurrenceEndDate?: string
  parentTaskId?: string
  tags?: string[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}
