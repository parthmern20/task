import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Task, TaskHistory } from "@/lib/types"
import { serializeTask } from "@/lib/task-utils"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)

    const view = searchParams.get("view") // today, week, backlog, all
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const query: any = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    if (view === "today") {
      query.dueDate = { $lte: endOfToday }
      query.status = "pending"
    } else if (view === "week") {
      query.dueDate = { $gte: today, $lte: endOfWeek }
      query.status = "pending"
    } else if (view === "backlog") {
      query.dueDate = { $lt: today }
      query.status = "pending"
    } else if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    if (status) {
      query.status = status
    }

    const tasks = await db.collection<Task>("tasks").find(query).sort({ dueDate: 1, priority: -1 }).toArray()

    return NextResponse.json(tasks.map(serializeTask))
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const body = await request.json()

    const task: Task = {
      title: body.title,
      description: body.description,
      dueDate: new Date(body.dueDate),
      priority: body.priority || "medium",
      status: "pending",
      isRecurring: body.isRecurring || false,
      recurrencePattern: body.recurrencePattern || "none",
      recurrenceInterval: body.recurrenceInterval,
      recurrenceEndDate: body.recurrenceEndDate ? new Date(body.recurrenceEndDate) : undefined,
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Task>("tasks").insertOne(task)

    // Log to history
    await db.collection<TaskHistory>("taskHistory").insertOne({
      taskId: result.insertedId,
      taskTitle: task.title,
      action: "created",
      timestamp: new Date(),
    })

    return NextResponse.json({
      ...serializeTask(task),
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
