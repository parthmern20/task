import { SidebarNav } from "@/components/sidebar-nav"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1">
        <CalendarView />
      </main>
    </div>
  )
}
