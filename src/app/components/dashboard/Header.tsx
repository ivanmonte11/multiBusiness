"use client"

import { useState } from "react"
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Search bar */}
          <div className="hidden md:block ml-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-64 pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-4 border"
              />
            </div>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* User menu */}
          <div className="flex items-center">
            <div className="hidden md:flex md:flex-col md:items-end md:mr-3">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {session?.user?.tenant || "tenant"}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search (hidden on desktop) */}
      <div className="md:hidden px-4 pt-2 pb-4 border-t border-gray-200">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos, clientes..."
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-4 border"
          />
        </div>
      </div>

      {/* Mobile menu (shown when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <a
              href="#"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Productos
            </a>
            <a
              href="#"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Ventas
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}