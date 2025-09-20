"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    CalendarIcon
} from "@heroicons/react/24/outline"

interface Customer {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    createdAt: string
    salesCount: number
    totalSpent: number
}

interface Sale {
    id: string
    saleNumber: string
    total: number
    status: string
    paymentMethod: string
    createdAt: string
    items: Array<{
        quantity: number
        unitPrice: number
        subtotal: number
        product: {
            name: string
        }
    }>
}

export default function CustomerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    })

    useEffect(() => {
        if (params.id) {
            fetchCustomerData()
            
        }
    }, [params.id, params.tenant])

    // Elimina fetchCustomerSales y haz todo en fetchCustomerData
const fetchCustomerData = async () => {
  try {
    const response = await fetch(`/api/${params.tenant}/customers/${params.id}`)
    if (response.ok) {
      const data = await response.json()
      console.log('API Response:', data) // ← Verifica que data.sales esté presente
      setCustomer(data)
      setSales(data.sales || []) // ← Esto ahora debería funcionar
      setFormData({
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || ""
      })
    }
  } catch (error) {
    console.error("Error fetching customer:", error)
  } finally {
    setLoading(false)
  }
}

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(`/api/${params.tenant}/customers/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const updatedCustomer = await response.json()
                setCustomer(updatedCustomer)
                setEditing(false)
                alert("Cliente actualizado correctamente")
            } else {
                alert("Error al actualizar el cliente")
            }
        } catch (error) {
            console.error("Error updating customer:", error)
            alert("Error al actualizar el cliente")
        }
    }

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            const response = await fetch(`/api/${params.tenant}/customers/${params.id}`, {
                method: "DELETE"
            })

            if (response.ok) {
                alert("Cliente eliminado correctamente")
                router.push(`/${params.tenant}/customers`)
            } else {
                alert("Error al eliminar el cliente")
            }
        } catch (error) {
            console.error("Error deleting customer:", error)
            alert("Error al eliminar el cliente")
        }
    }

    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) {
            return 'Fecha no disponible'
        }

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return 'Fecha inválida'
            }

            return date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Error en fecha'
        }
    }

    const formatCurrency = (amount: number | undefined | null) => {
        return `$${(amount ?? 0).toLocaleString('es-AR')}`
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Cliente no encontrado</h2>
                    <p className="text-gray-600 mb-4">El cliente que buscas no existe o no tienes acceso.</p>
                    <Link
                        href={`/${params.tenant}/customers`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Volver a clientes
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href={`/${params.tenant}/customers`}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {editing ? "Editar Cliente" : customer.name}
                        </h1>
                        <p className="text-gray-600">
                            {editing ? "Actualiza la información del cliente" : `Detalles del cliente`}
                        </p>
                    </div>
                </div>

                {!editing && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            <PencilIcon className="h-4 w-4" />
                            <span>Editar</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            <TrashIcon className="h-4 w-4" />
                            <span>Eliminar</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Información del Cliente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tarjeta de Información */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>

                    {editing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-gray-900">{customer.name}</span>
                            </div>

                            {customer.email && (
                                <div className="flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-gray-900">{customer.email}</span>
                                </div>
                            )}

                            {customer.phone && (
                                <div className="flex items-center">
                                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-gray-900">{customer.phone}</span>
                                </div>
                            )}

                            {customer.address && (
                                <div className="flex items-start">
                                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <span className="text-gray-900">{customer.address}</span>
                                </div>
                            )}

                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-gray-600 text-sm">
                                    Cliente desde: {customer.createdAt ? formatDate(customer.createdAt) : 'Fecha no disponible'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Estadísticas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <ShoppingCartIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-900">
                                {customer.salesCount ?? 0}
                            </div>
                            <div className="text-sm text-blue-600">Compras totales</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <CurrencyDollarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-900">
                                {formatCurrency(customer.totalSpent)}
                            </div>
                            <div className="text-sm text-green-600">Total gastado</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historial de Compras */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Historial de Compras</h2>
                </div>

                {sales.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras registradas</h3>
                        <p className="text-gray-600">Este cliente aún no ha realizado ninguna compra.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Venta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Método
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Productos
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
                                            <div className="text-sm text-gray-500">
                                                {sale.status === 'COMPLETED' ? 'Completada' :
                                                    sale.status === 'CANCELLED' ? 'Anulada' :
                                                        sale.status === 'REFUNDED' ? 'Con Devolución' : sale.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(sale.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {getPaymentMethodText(sale.paymentMethod)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {sale.items.length} producto(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {formatCurrency(Number(sale.total))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/${params.tenant}/sales/${sale.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                            >
                                                Ver detalle
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}