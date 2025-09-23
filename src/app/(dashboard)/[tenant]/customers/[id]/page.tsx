"use client"

import { useEffect, useState, useCallback } from "react" 
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeftIcon,
    UserIcon 
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
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    })

    const fetchCustomerData = useCallback(async () => {
        try {
            const response = await fetch(`/api/${params.tenant}/customers/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                console.log('API Response:', data)
                setCustomer(data)
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
    }, [params.tenant, params.id])

    useEffect(() => {
        if (params.id) {
            fetchCustomerData()
        }
    }, [params.id, params.tenant, fetchCustomerData])

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
        } catch {
            console.error("Error updating customer")
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
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link
                        href={`/${params.tenant}/customers`}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        Volver a clientes
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-gray-600">ID: {customer.id}</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        {editing ? "Cancelar" : "Editar"}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
                
                {editing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Guardar Cambios
                        </button>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                <p className="text-gray-900">{customer.email || "No especificado"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                                <p className="text-gray-900">{customer.phone || "No especificado"}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Dirección:</span>
                                <p className="text-gray-900">{customer.address || "No especificada"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Cliente desde:</span>
                                <p className="text-gray-900">
                                    {new Date(customer.createdAt).toLocaleDateString('es-AR')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{customer.salesCount}</div>
                    <div className="text-sm text-gray-600">Ventas totales</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        ${customer.totalSpent.toLocaleString('es-AR')}
                    </div>
                    <div className="text-sm text-gray-600">Total gastado</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {customer.salesCount > 0 ? 
                            `$${Math.round(customer.totalSpent / customer.salesCount).toLocaleString('es-AR')}` : 
                            '$0'
                        }
                    </div>
                    <div className="text-sm text-gray-600">Promedio por venta</div>
                </div>
            </div>
        </div>
    )
}