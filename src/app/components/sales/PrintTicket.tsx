"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import {
  PrinterIcon,
  DocumentTextIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

interface Sale {
  id: string
  saleNumber: string
  total: number
  paymentMethod: string
  createdAt: string
  customer: {
    name: string
    phone?: string
  } | null
  user: {
    name: string
  }
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    unitPrice: number
    subtotal: number
  }>
}

interface PrintTicketProps {
  sale: Sale
  tenantName: string
  tenantPhone?: string
  tenantEmail?: string
  tenantAddress?: string
  tenantTaxId?: string
  onClose: () => void
}

export default function PrintTicket({ sale, tenantName, tenantPhone, tenantEmail, tenantAddress, tenantTaxId, onClose }: PrintTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ticket-${sale.saleNumber}`,
    onAfterPrint: onClose
  })

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH": return "EFECTIVO"
      case "CARD": return "TARJETA"
      case "TRANSFER": return "TRANSFERENCIA"
      case "OTHER": return "OTRO"
      default: return method
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Imprimir Ticket</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="p-4">
          <div
            ref={ticketRef}
            className="bg-white p-4"
            style={{
              width: '80mm',        // Ancho exacto para térmicas
              fontSize: '11px',     // Tamaño óptimo para tickets
              fontFamily: 'monospace', // Fuente de tipo ticket
              margin: '0 auto',
              maxWidth: '80mm'
            }}
          >
            {/* Header del Ticket */}
            <div className="text-center mb-4">
              <h1 className="font-bold text-sm uppercase">{tenantName}</h1>
              <p className="text-xs">Sistema Multirubro</p>
              {tenantPhone && <p className="text-xs">Tel: {tenantPhone}</p>}
              {tenantEmail && <p className="text-xs">Email: {tenantEmail}</p>}
              {tenantAddress && <p className="text-xs">{tenantAddress}</p>}
              {tenantTaxId && <p className="text-xs">CUIT: {tenantTaxId}</p>}
            </div>

            {/* Información de la venta */}
            <div className="border-t border-b border-gray-300 py-2 mb-2">
              <div className="flex justify-between">
                <span>Ticket:</span>
                <span className="font-bold">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{formatDate(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendedor:</span>
                <span>{sale.user.name}</span>
              </div>
            </div>

            {/* Cliente */}
            {sale.customer && (
              <div className="mb-2">
                <div className="font-bold">CLIENTE:</div>
                <div>{sale.customer.name}</div>
                {sale.customer.phone && (
                  <div>Tel: {sale.customer.phone}</div>
                )}
              </div>
            )}

            {/* Productos */}
            <div className="mb-4">
              <div className="font-bold border-b border-gray-300 pb-1">PRODUCTOS</div>
              {sale.items.map((item, index) => (
                <div key={index} className="border-b border-gray-200 py-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.product.name}</span>
                    <span>${item.unitPrice.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{item.quantity} und.</span>
                    <span>${item.subtotal.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-300 pt-2 mb-4">
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>${sale.total.toLocaleString('es-AR')}</span>
              </div>
              <div className="text-center mt-1">
                <span className="font-medium">Método: {getPaymentMethodText(sale.paymentMethod)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs border-t border-gray-300 pt-2">
              <p>¡Gracias por su compra!</p>
              <p>Vuelva pronto</p>
              <p className="mt-2">========================</p> {/* Línea de corte */}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-3 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}