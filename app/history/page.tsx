import { SidebarNav } from "@/components/sidebar-nav"
import { HistoryView } from "@/components/history-view"

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 pt-14 md:pt-0">
        <HistoryView />
      </main>
    </div>
  )
}
