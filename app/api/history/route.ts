import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { TaskHistory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const action = searchParams.get("action")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const query: any = {}

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    if (action) {
      query.action = action
    }

    const history = await db
      .collection<TaskHistory>("taskHistory")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json(
      history.map((h) => ({
        ...h,
        _id: h._id?.toString(),
        taskId: h.taskId.toString(),
        timestamp: h.timestamp.toISOString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
