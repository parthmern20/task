import { SidebarNav } from "@/components/sidebar-nav"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 pt-14 md:pt-0">
        <Dashboard />
      </main>
    </div>
  )
}
