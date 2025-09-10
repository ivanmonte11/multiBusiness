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
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"

interface SidebarProps {
  tenant: string
}

const navigation = [
  { name: "Dashboard", href: "/[tenant]", icon: HomeIcon },
  { name: "Productos", href: "/[tenant]/products", icon: CubeIcon },
  { name: "Ventas", href: "/[tenant]/sales", icon: ShoppingCartIcon },
  { name: "Reportes", href: "/[tenant]/reports", icon: ChartBarIcon },
  { name: "Clientes", href: "/[tenant]/customers", icon: UsersIcon },
  { name: "Configuración", href: "/[tenant]/settings", icon: Cog6ToothIcon },
]

export default function Sidebar({ tenant }: SidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-indigo-600 border-r">
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