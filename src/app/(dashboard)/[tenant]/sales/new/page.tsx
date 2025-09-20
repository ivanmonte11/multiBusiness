// src/app/(dashboard)/[tenant]/sales/new/page.tsx
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import SaleForm from "@/app/components/sales/SaleForm"

interface SaleData {
  customerId?: string
  paymentMethod: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
}

export default function NewSalePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (saleData: SaleData) => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch(`/api/${params.tenant}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        router.push(`/${params.tenant}/sales?message=Venta creada correctamente`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error al crear la venta")
      }
    } catch (error) {
      setError("Error de conexión al crear la venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-gray-600">Registra una nueva venta en el sistema</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <SaleForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${params.tenant}/sales`)}
        loading={loading}
      />
    </div>
  )
}