"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CalendarDays, History, ListTodo, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
]

function NavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()

  return (
    <>
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
              onClick={onNavClick}
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
    </>
  )
}

export function SidebarNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <span className="font-bold">TaskFlow</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <NavContent onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <aside className="hidden md:block w-64 border-r bg-card min-h-screen p-4 flex-shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
