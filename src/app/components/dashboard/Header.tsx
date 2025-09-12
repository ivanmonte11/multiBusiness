"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import BarcodeScanner from "@/app/components/products/BarcodeScanner"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar scanner USB (códigos largos + Enter)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Detectar si es un scanner USB
    if (value.length >= 8 || value.endsWith('\n')) {
      const cleanCode = value.replace('\n', '').trim()
      performSearch(cleanCode)
    } else {
      // Búsqueda normal con timeout
      timeoutRef.current = setTimeout(() => {
        if (value.length > 2) {
          performSearch(value)
        }
      }, 500)
    }
    if (status === "loading") {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
      </div>
    </header>
  )
}
  }

  // Realizar la búsqueda
  const performSearch = (term: string) => {
    if (!term.trim()) return

    // Redirigir a página de productos con filtro
    router.push(`/${params.tenant}/products?search=${encodeURIComponent(term)}`)
    setSearchTerm("")

    // Cerrar scanner si está abierto
    setShowScanner(false)
  }

  // Escaneo desde cámara
  const handleScanFromCamera = (barcode: string) => {
    performSearch(barcode)
    setShowScanner(false)
  }

  // Auto-enfocar el search al mostrar scanner
  useEffect(() => {
    if (!showScanner && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showScanner])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

          {/* Search bar con scanner */}
          <div className="hidden md:flex items-center ml-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar producto o escanear código..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-80 pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-4 border"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-3 py-2 text-gray-400 hover:text-indigo-600"
                  title="Escanear código"
                >
                  <QrCodeIcon className="h-4 w-4" />
                </button>
              </div>
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

      {/* Mobile search con scanner */}
      <div className="md:hidden px-4 pt-2 pb-4 border-t border-gray-200">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos o escanear..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-4 border"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="text-gray-400 hover:text-indigo-600"
            >
              <QrCodeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scanner modal */}
      {/* Scanner modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Escanear código de barras</h3>
              <p className="text-sm text-gray-600">Usa la cámara para escanear un producto</p>
            </div>

            <div className="p-4">
              <BarcodeScanner
                onScan={(barcode) => {
                  // Redirigir a productos con el código escaneado
                  performSearch(barcode)
                  setShowScanner(false)
                }}
                onClose={() => setShowScanner(false)}
              />
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowScanner(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cerrar Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Productos
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Ventas
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}