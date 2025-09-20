"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

interface ReportData {
  totalSales: number
  totalRevenue: number
  averageTicket: number
  totalCustomers: number
  salesByPaymentMethod: { method: string; amount: number; count: number }[]
  salesByStatus: { status: string; count: number; amount: number }[]
  dailySales: { date: string; sales: number; revenue: number }[]
  topProducts: { product: string; quantity: number; revenue: number }[]
}

interface DateRange {
  start: string
  end: string
}

export default function ReportsPage() {
  const params = useParams()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Últimos 30 días
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchReportData()
  }, [params.tenant, dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end
      })

      const response = await fetch(`/api/${params.tenant}/reports?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateRange(prev => ({ ...prev, [name]: value }))
  }

  const exportToCSV = () => {
    if (!reportData) return

    const csvContent = [
      ["Reporte de Ventas", "", "", ""],
      ["Período", `${dateRange.start} al ${dateRange.end}`, "", ""],
      ["", "", "", ""],
      ["Métricas", "Valor", "", ""],
      ["Ventas totales", reportData.totalSales.toString(), "", ""],
      ["Ingresos totales", `$${reportData.totalRevenue.toLocaleString('es-AR')}`, "", ""],
      ["Ticket promedio", `$${reportData.averageTicket.toLocaleString('es-AR')}`, "", ""],
      ["Clientes atendidos", reportData.totalCustomers.toString(), "", ""],
      ["", "", "", ""],
      ["Ventas por método de pago", "", "", ""],
      ["Método", "Cantidad", "Monto", ""],
      ...reportData.salesByPaymentMethod.map(item => [
        item.method,
        item.count.toString(),
        `$${item.amount.toLocaleString('es-AR')}`,
        ""
      ]),
      ["", "", "", ""],
      ["Ventas por estado", "", "", ""],
      ["Estado", "Cantidad", "Monto", ""],
      ...reportData.salesByStatus.map(item => [
        item.status,
        item.count.toString(),
        `$${item.amount.toLocaleString('es-AR')}`,
        ""
      ])
    ]

    const csv = csvContent.map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-ventas-${dateRange.start}-al-${dateRange.end}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h1>
          <p className="text-gray-600">Estadísticas y análisis de rendimiento</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Fecha inicial
            </label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Fecha final
            </label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {!reportData ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No hay datos de reportes</h2>
          <p className="text-gray-600">No se encontraron datos para el período seleccionado</p>
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas totales</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportData.totalRevenue.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportData.averageTicket.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalCustomers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos y tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventas por método de pago */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por método de pago</h3>
              <div className="space-y-3">
                {reportData.salesByPaymentMethod.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.method}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${item.amount.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} ventas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ventas por estado */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por estado</h3>
              <div className="space-y-3">
                {reportData.salesByStatus.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.status === 'COMPLETED' ? 'Completadas' : 
                       item.status === 'CANCELLED' ? 'Anuladas' : 
                       item.status === 'REFUNDED' ? 'Con Devolución' : item.status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${item.amount.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} ventas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Productos más vendidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos más vendidos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity} und.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.revenue.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}