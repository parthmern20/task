"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CalendarDays, History, ListTodo } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <ListTodo className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">TaskFlow</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
