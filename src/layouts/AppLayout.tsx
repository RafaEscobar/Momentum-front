import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useAppShortcuts } from '@/hooks/useAppShortcuts'
import { ContentContainer } from '@/layouts/components/ContentContainer'
import { Sidebar } from '@/layouts/components/Sidebar'
import { Topbar } from '@/layouts/components/Topbar'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  useAppShortcuts()

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </div>
    </div>
  )
}
