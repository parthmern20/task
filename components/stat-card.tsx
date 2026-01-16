"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: "default" | "warning" | "success"
  onClick?: () => void
}

export function StatCard({ title, value, icon: Icon, variant = "default", onClick }: StatCardProps) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-amber-50 border-amber-200",
    success: "bg-green-50 border-green-200",
  }

  const iconStyles = {
    default: "text-muted-foreground",
    warning: "text-amber-600",
    success: "text-green-600",
  }

  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-md", variantStyles[variant])} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={cn("h-8 w-8", iconStyles[variant])} />
        </div>
      </CardContent>
    </Card>
  )
}
