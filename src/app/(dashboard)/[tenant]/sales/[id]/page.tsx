"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PrinterIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowRightCircleIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline"
import PrintTicket from "@/app/components/sales/PrintTicket"

interface Sale {
  id: string
  saleNumber: string
  total: number
  paymentMethod: string
  createdAt: string
  status: 'COMPLETE' | 'CANCELLED' | 'REFUNDED'
  customer: {
    name: string
    email?: string
    phone?: string
    adress?: string
    taxId?: string
  } | null
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: {
      name: string
    }
  }>
  paymentNote?: string
}

interface TenantInfo {
  name: string
  phone?: string
  email?: string
  address?: string
  taxId?: string
}

export default function SaleDetailPage() {
  const params = useParams()
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrint, setShowPrint] = useState(false)
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    name: String(params.tenant)
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (params.id && params.tenant) {
      fetchSale()
      fetchTenantInfo()
    }
  }, [params.id, params.tenant])

  const fetchTenantInfo = async () => {
    try {
      const response = await fetch(`/api/${params.tenant}/tenant-info`)
      if (response.ok) {
        const data = await response.json()
        setTenantInfo({
          name: data.name || String(params.tenant),
          phone: data.phone,
          email: data.email,
          address: data.address,
          taxId: data.taxId
        })
      }
    } catch (error) {
      console.error("Error fetching tenant info:", error)
      setTenantInfo(prev => ({ ...prev, name: String(params.tenant) }))
    }
  }

  const handleResendReceipt = async () => {
    if (!sale) return

    setIsProcessing(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/${params.tenant}/sales/resend-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saleId: sale.id,
          tenantId: String(params.tenant)
        })
      })

      if (response.ok) {
        const data = await response.json()

        // 📱 OPCION 1: Abrir WhatsApp automáticamente
        if (data.data.whatsapp.url) {
          window.open(data.data.whatsapp.url, '_blank')
          setMessage({ type: 'success', text: 'Abriendo WhatsApp...' })
        }
        // 📧 OPCION 2: Cliente sin teléfono
        else if (data.data.customer?.email) {
          setMessage({ type: 'info', text: 'Cliente no tiene teléfono, pero tiene email registrado' })
          // Aquí podrías agregar lógica para email
        }
        // ❌ OPCION 3: Sin datos de contacto
        else {
          setMessage({ type: 'warning', text: 'Cliente no tiene datos de contacto registrados' })
        }
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al obtener datos' })
      }
    } catch (error) {
      console.error('Error reenviando comprobante:', error)
      setMessage({ type: 'error', text: 'Error al procesar' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para crear devolución
  const handleCreateRefund = async () => {
    if (!sale) return

    if (!confirm('¿Estás seguro de crear una devolución para esta venta?')) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/${params.tenant}/sales/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saleId: sale.id,
          tenantId: String(params.tenant)
        })
      })

      if (response.ok) {
        const refundData = await response.json()
        setMessage({ type: 'success', text: 'Devolución creada exitosamente' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al crear devolución' })
      }
    } catch (error) {
      console.error('Error creando devolución:', error)
      setMessage({ type: 'error', text: 'Error al crear devolución' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para anular venta
  const handleCancelSale = async () => {
    if (!sale) return

    console.log('🔍 Enviando cancelación para:', {
      saleId: sale.id,
      tenantId: params.tenant
    })

    if (!confirm('¿Estás seguro de anular esta venta? Esta acción no se puede deshacer.')) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      // ¡URL CORREGIDA! Elimina "/:tenant"
      const response = await fetch(`/api/${params.tenant}/sales/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saleId: sale.id,
          tenantId: String(params.tenant)
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Venta anulada exitosamente' })
        fetchSale()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al anular venta' })
      }
    } catch (error) {
      console.error('Error anulando venta:', error)
      setMessage({ type: 'error', text: 'Error al anular venta' })
    } finally {
      setIsProcessing(false)
    }
  }

  const fetchSale = async () => {
    try {
      const tenant = String(params.tenant)
      const id = String(params.id)

      const response = await fetch(`/api/${tenant}/sales/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSale(data)
      } else {
        console.error("Error fetching sale")
      }
    } catch (error) {
      console.error("Error fetching sale:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Icono según método de pago
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <BanknotesIcon className="h-5 w-5 text-green-600" />
      case "CARD":
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />
      case "TRANSFER":
        return <ArrowRightCircleIcon className="h-5 w-5 text-purple-600" />
      case "OTHER":
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" />
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  // Texto según método de pago
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH":
        return "Efectivo"
      case "CARD":
        return "Tarjeta"
      case "TRANSFER":
        return "Transferencia"
      case "OTHER":
        return "Otro"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Venta no encontrada</h2>
          <p className="text-gray-600 mb-4">La venta que buscas no existe o no tienes acceso a ella.</p>
          <Link
            href={`/${params.tenant}/sales`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Volver a ventas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {showPrint && sale && (
        <PrintTicket
          sale={sale}
          tenantName={tenantInfo.name}
          tenantPhone={tenantInfo.phone}
          tenantEmail={tenantInfo.email}
          tenantAddress={tenantInfo.address}
          tenantTaxId={tenantInfo.taxId}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* Mensajes de estado */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${message.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/${params.tenant}/sales`}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalle de Venta</h1>
              <p className="text-gray-600">Número: {sale.saleNumber}</p>
            </div>
          </div>

          <button
            onClick={() => setShowPrint(true)}
            disabled={sale.status === 'CANCELLED'}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Imprimir Ticket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Header de la venta */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Resumen de la Venta</h2>
                    <p className="text-sm text-gray-600">{formatDate(sale.createdAt)}</p>
                    {sale.status === 'CANCELLED' && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Anulada
                      </span>
                    )}
                    {sale.status === 'REFUNDED' && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        Devuelta
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${Number(sale.total).toLocaleString('es-AR')}
                    </div>
                    <div className="flex items-center justify-end space-x-1 text-sm text-gray-600">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span>{getPaymentMethodText(sale.paymentMethod)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items de la venta */}
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Productos vendidos</h3>
                <div className="space-y-3">
                  {sale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ${Number(item.unitPrice).toLocaleString('es-AR')}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${Number(item.subtotal).toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${Number(sale.total).toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información lateral */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Información del Cliente</h3>
              {sale.customer ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">Nombre</div>
                    <div className="font-medium">{sale.customer.name}</div>
                  </div>
                  {sale.customer.email && (
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{sale.customer.email}</div>
                    </div>
                  )}
                  {sale.customer.phone && (
                    <div>
                      <div className="text-sm text-gray-600">Teléfono</div>
                      <div className="font-medium">{sale.customer.phone}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">Cliente ocasional</div>
              )}
            </div>

            {/* Información de pago */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Información de Pago</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Método</div>
                  <div className="font-medium flex items-center space-x-2">
                    {getPaymentMethodIcon(sale.paymentMethod)}
                    <span>{getPaymentMethodText(sale.paymentMethod)}</span>
                  </div>
                </div>
                {sale.paymentNote && (
                  <div>
                    <div className="text-sm text-gray-600">Detalles</div>
                    <div className="font-medium">{sale.paymentNote}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Vendedor</div>
                  <div className="font-medium">{sale.user.name}</div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-2">
                <button
                  onClick={handleResendReceipt}
                  disabled={isProcessing || !sale?.customer?.phone}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : '📱 Enviar por WhatsApp'}
                </button>

                {sale?.customer?.phone && (
                  <div className="text-xs text-gray-500 mt-1">
                    Enviar a: {sale.customer.phone}
                  </div>
                )}

                <button
                  onClick={handleCreateRefund}
                  disabled={isProcessing || sale.status === 'CANCELLED'}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Crear devolución'}
                </button>

                <button
                  onClick={handleCancelSale}
                  disabled={isProcessing || sale.status === 'CANCELLED'}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Anular venta'}
                </button>
              </div>

              {sale.status === 'CANCELLED' && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                  Esta venta ha sido anulada
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}