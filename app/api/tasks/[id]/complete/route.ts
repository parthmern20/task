import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Task, TaskHistory } from "@/lib/types"
import { ObjectId } from "mongodb"
import { calculateNextDueDate } from "@/lib/task-utils"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const body = await request.json()
    const action = body.action || "completed" // completed, skipped, deferred

    const task = await db.collection<Task>("tasks").findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update the current task
    const updateData: Partial<Task> = {
      status: action,
      updatedAt: new Date(),
    }

    if (action === "completed") {
      updateData.completedAt = new Date()
    } else if (action === "deferred" && body.newDueDate) {
      updateData.dueDate = new Date(body.newDueDate)
      updateData.status = "pending"
    }

    await db.collection<Task>("tasks").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    // Log to history
    await db.collection<TaskHistory>("taskHistory").insertOne({
      taskId: new ObjectId(id),
      taskTitle: task.title,
      action: action,
      timestamp: new Date(),
      notes: body.notes,
    })

    // If this is a recurring task template and it was completed/skipped, create next instance
    if (task.isRecurring && task.recurrencePattern !== "none" && action !== "deferred") {
      const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrencePattern, task.recurrenceInterval || 1)

      // Check if we should create next instance (within recurrence end date)
      const shouldCreate = !task.recurrenceEndDate || nextDueDate <= task.recurrenceEndDate

      if (shouldCreate) {
        // Update the recurring task template with next due date
        await db.collection<Task>("tasks").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              dueDate: nextDueDate,
              status: "pending",
              completedAt: undefined,
              updatedAt: new Date(),
            },
          },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
