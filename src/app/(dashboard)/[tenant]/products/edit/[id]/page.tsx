"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ProductForm from "@/app/components/products/ProductForm"
import { Product, ProductFormData } from "@/types"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/${params.tenant}/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          setError("Producto no encontrado")
        }
      } catch {
        setError("Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.tenant, params.id])

 
  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const response = await fetch(`/api/${params.tenant}/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/${params.tenant}/products?message=Producto actualizado correctamente`)
      } else {
        setError("Error al actualizar el producto")
      }
    } catch { 
      setError("Error de conexión")
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/${params.tenant}/products/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push(`/${params.tenant}/products?message=Producto eliminado correctamente`)
      } else {
        setError("Error al eliminar el producto")
      }
    } catch { 
      setError("Error de conexión")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Producto no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm 
          onSubmit={handleSubmit} 
          onDelete={handleDelete}
          initialData={{
            name: product.name,
            description: product.description || "",
            price: Number(product.price),
            quantity: Number(product.quantity),
            category: product.category,
            barCode: product.barCode || "",
            sku: product.sku || "",
            cost: 0,
            image: "", 
            weight: 0,
            dimensions: "",
            lowStockThreshold: 5,
            isActive: true
          }}
          isEdit={true}
        />
      </div>
    </div>
  )
}