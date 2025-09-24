'use client'

import { useState } from 'react'
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Sidebar from "@/app/components/dashboard/SideBar"
import Header from "@/app/components/dashboard/Header"
import { CreditCardIcon } from '@heroicons/react/24/outline'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()

  // Redirección si no hay sesión
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Verificar tenant
  if (session.user.tenant !== params.tenant) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar desktop */}
      <Sidebar tenant={params.tenant as string} />
      
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col w-64 max-w-xs">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Cerrar sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto bg-indigo-600">
              <Sidebar 
                tenant={params.tenant as string} 
                isMobile 
                onClose={() => setSidebarOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}