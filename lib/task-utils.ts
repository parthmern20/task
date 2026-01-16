import type { Task, RecurrencePattern } from "./types"

export function calculateNextDueDate(currentDate: Date, pattern: RecurrencePattern, interval = 1): Date {
  const next = new Date(currentDate)

  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + interval)
      break
    case "weekly":
      next.setDate(next.getDate() + 7 * interval)
      break
    case "monthly":
      next.setMonth(next.getMonth() + interval)
      break
    case "yearly":
      next.setFullYear(next.getFullYear() + interval)
      break
    default:
      break
  }

  return next
}

export function createRecurringTaskInstance(parentTask: Task, dueDate: Date): Omit<Task, "_id"> {
  return {
    title: parentTask.title,
    description: parentTask.description,
    dueDate,
    priority: parentTask.priority,
    status: "pending",
    isRecurring: false,
    recurrencePattern: "none",
    parentTaskId: parentTask._id,
    tags: parentTask.tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function isOverdue(dueDate: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function isToday(date: Date): boolean {
  const today = new Date()
  const d = new Date(date)
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

export function isThisWeek(date: Date): boolean {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const d = new Date(date)
  return d >= startOfWeek && d <= endOfWeek
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function serializeTask(task: Task): any {
  return {
    ...task,
    _id: task._id?.toString(),
    parentTaskId: task.parentTaskId?.toString(),
    dueDate: task.dueDate.toISOString(),
    recurrenceEndDate: task.recurrenceEndDate?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
