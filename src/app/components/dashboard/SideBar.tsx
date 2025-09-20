// app/components/dashboard/SideBar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
import { QrCodeIcon } from "@heroicons/react/24/outline"

interface SidebarProps {
  tenant: string
  isMobile?: boolean
  onClose?: () => void
}

const navigation = [
  { name: "Dashboard", href: "/[tenant]", icon: HomeIcon },
  { name: "Productos", href: "/[tenant]/products", icon: CubeIcon },
  { name: "Escanear", href: "/[tenant]/scan", icon: QrCodeIcon},
  { name: "Ventas", href: "/[tenant]/sales", icon: ShoppingCartIcon },
  { name: "Reportes", href: "/[tenant]/reports", icon: ChartBarIcon },
  { name: "Clientes", href: "/[tenant]/customers", icon: UsersIcon },
  { name: "Configuración", href: "/[tenant]/settings", icon: Cog6ToothIcon },
]

export default function Sidebar({ tenant, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 md:hidden' : 'hidden md:flex md:w-64 md:flex-col'}`}>
      {/* Overlay para móvil */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}
      
      {/* Contenido del sidebar */}
      <div className={`
        flex flex-col flex-grow pt-5 overflow-y-auto bg-indigo-600 border-r
        ${isMobile ? 'fixed inset-y-0 left-0 w-64 max-w-xs z-50' : 'relative'}
      `}>
        {/* Botón cerrar en móvil */}
        {isMobile && (
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        )}

        {/* Logo y nombre del tenant */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-semibold">Mi Negocio</h1>
            <p className="text-indigo-200 text-sm">{tenant}</p>
          </div>
        </div>

        {/* Navegación */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const href = item.href.replace("[tenant]", tenant)
              const isActive = pathname === href || 
                              (pathname?.startsWith(href) && href !== `/${tenant}`)
              
              return (
                <Link
                  key={item.name}
                  href={href}
                  onClick={isMobile ? onClose : undefined}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? "text-white" : "text-indigo-300 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Usuario y logout */}
          <div className="flex-shrink-0 flex border-t border-indigo-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Usuario</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-indigo-200 hover:text-white flex items-center mt-1"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}