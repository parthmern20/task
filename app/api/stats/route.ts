import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Task, DashboardStats } from "@/lib/types"

export async function GET() {
  try {
    const db = await getDatabase()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const [todayCount, weekCount, backlogCount, completedToday] = await Promise.all([
      db.collection<Task>("tasks").countDocuments({
        dueDate: { $lte: endOfToday },
        status: "pending",
      }),
      db.collection<Task>("tasks").countDocuments({
        dueDate: { $gte: today, $lte: endOfWeek },
        status: "pending",
      }),
      db.collection<Task>("tasks").countDocuments({
        dueDate: { $lt: today },
        status: "pending",
      }),
      db.collection<Task>("tasks").countDocuments({
        completedAt: { $gte: today, $lte: endOfToday },
        status: "completed",
      }),
    ])

    const stats: DashboardStats = {
      todayCount,
      weekCount,
      backlogCount,
      completedToday,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
