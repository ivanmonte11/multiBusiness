"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  ShoppingCartIcon,
  UserIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"

interface Sale {
  id: string
  saleNumber: string
  total: number
  paymentMethod: string
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
  customer: {
    name: string
  } | null
  user: {
    name: string
    email: string
  }
  items: Array<{
    quantity: number
  }>
}

export default function SalesPage() {
  const params = useParams()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [params.tenant])

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/${params.tenant}/sales`)
      if (response.ok) {
        const data = await response.json()
        setSales(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800"
      case "CARD": return "bg-blue-100 text-blue-800" 
      case "TRANSFER": return "bg-purple-100 text-purple-800"
      case "OTHER": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH": return "Efectivo"
      case "CARD": return "Tarjeta"
      case "TRANSFER": return "Transferencia"
      case "OTHER": return "Otro"
      default: return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "REFUNDED": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Completada"
      case "CANCELLED": return "Anulada"
      case "REFUNDED": return "Devuelta"
      default: return status
    }
  }

  const handlePrint = async (sale: Sale) => {
  if (sale.status === 'CANCELLED') {
    alert('No se puede imprimir una venta anulada')
    return
  }

  if (sale.status === 'REFUNDED') {
    if (!confirm('Esta venta tiene devoluciones. ¿Deseas imprimir el ticket original?')) {
      return
    }
  }

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Contenido simple del ticket
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket ${sale.saleNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 11px; 
              width: 80mm; 
              margin: 0 auto;
              padding: 10px;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .border-section { 
              border-top: 1px solid #ccc; 
              border-bottom: 1px solid #ccc; 
              padding: 5px 0; 
              margin: 10px 0;
            }
            .flex-between { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .text-center { text-align: center; }
            .product { margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="bold">MI NEGOCIO</h1>
            <p>Sistema Multirubro</p>
          </div>
          
          <div class="border-section">
            <div class="flex-between">
              <span>Ticket:</span>
              <span class="bold">${sale.saleNumber}</span>
            </div>
            <div class="flex-between">
              <span>Fecha:</span>
              <span>${formatDate(sale.createdAt)}</span>
            </div>
            <div class="flex-between">
              <span>Vendedor:</span>
              <span>${sale.user.name}</span>
            </div>
          </div>

          ${sale.customer ? `
          <div>
            <div class="bold">CLIENTE:</div>
            <div>${sale.customer.name}</div>
          </div>
          ` : ''}

          <div class="border-section">
            <div class="bold">PRODUCTOS:</div>
            ${sale.items.map((item, index) => `
              <div class="product">
                <div class="flex-between">
                  <span>Producto ${index + 1}</span>
                  <span>${item.quantity} und.</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div>
            <div class="flex-between bold">
              <span>TOTAL:</span>
              <span>$${sale.total.toLocaleString('es-AR')}</span>
            </div>
            <div class="text-center">
              <span class="bold">Método: ${getPaymentMethodText(sale.paymentMethod)}</span>
            </div>
          </div>

          <div class="text-center" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p>¡Gracias por su compra!</p>
            <p>Vuelva pronto</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <Link
          href={`/${params.tenant}/sales/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Venta
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h2>
          <p className="text-gray-600 mb-4">Comienza registrando tu primera venta</p>
          <Link
            href={`/${params.tenant}/sales/new`}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crear primera venta
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{sale.saleNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{sale.customer?.name || "Cliente ocasional"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-900">
                        <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {sale.user?.name || "Sin asignar"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {formatDate(sale.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(sale.paymentMethod)}`}>
                        {getPaymentMethodText(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        ${Number(sale.total).toLocaleString('es-AR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/${params.tenant}/sales/${sale.id}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          title="Ver detalle"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => handlePrint(sale)}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                          title="Imprimir ticket"
                          disabled={sale.status === 'CANCELLED'}
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{sales.length}</span> ventas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}