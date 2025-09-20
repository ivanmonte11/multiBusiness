// app/components/dashboard/MobileSidebarHandler.tsx
'use client'

import { useEffect, useState } from 'react'
import Sidebar from './SideBar' // ← Importa SideBar con B mayúscula

export default function MobileSidebarHandler({ tenant }: { tenant: string }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpenSidebar = () => setIsOpen(true)
    const handleCloseSidebar = () => setIsOpen(false)

    document.addEventListener('openMobileSidebar', handleOpenSidebar)
    document.addEventListener('closeMobileSidebar', handleCloseSidebar)

    return () => {
      document.removeEventListener('openMobileSidebar', handleOpenSidebar)
      document.removeEventListener('closeMobileSidebar', handleCloseSidebar)
    }
  }, [])

  if (!isOpen) return null

  return <Sidebar tenant={tenant} isMobile onClose={() => setIsOpen(false)} />
}