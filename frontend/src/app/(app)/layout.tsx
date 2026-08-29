import { AppSidebar } from "@/components/layout/app-sidebar"
import { PageTransition } from "@/components/layout/page-transition"
import { SiteHeader } from "@/components/layout/site-header"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col p-4 md:p-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
