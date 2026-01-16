import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Task, TaskHistory } from "@/lib/types"
import { ObjectId } from "mongodb"
import { serializeTask } from "@/lib/task-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const task = await db.collection<Task>("tasks").findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(serializeTask(task))
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const body = await request.json()

    const updateData: Partial<Task> = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      recurrenceEndDate: body.recurrenceEndDate ? new Date(body.recurrenceEndDate) : undefined,
      updatedAt: new Date(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key as keyof Task] === undefined && delete updateData[key as keyof Task],
    )

    const result = await db
      .collection<Task>("tasks")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log to history
    await db.collection<TaskHistory>("taskHistory").insertOne({
      taskId: new ObjectId(id),
      taskTitle: result.title,
      action: "updated",
      timestamp: new Date(),
    })

    return NextResponse.json(serializeTask(result))
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()

    const task = await db.collection<Task>("tasks").findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await db.collection<Task>("tasks").deleteOne({ _id: new ObjectId(id) })

    // Log to history
    await db.collection<TaskHistory>("taskHistory").insertOne({
      taskId: new ObjectId(id),
      taskTitle: task.title,
      action: "deleted",
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
