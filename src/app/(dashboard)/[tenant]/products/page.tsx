"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import ProductTable from "@/app/components/products/ProductTable"
import ProductForm from "@/app/components/products/ProductForm"

interface Product {
  id: string
  name: string
  description: string | null
  price: number | string
  cost: number | string | null
  quantity: number
  barCode: string | null
  sku: string | null
  category: string
  image: string | null
  weight: number | string | null
  dimensions: string | null
  lowStockThreshold: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ProductsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Mostrar mensaje de éxito si viene por query params
    const messageParam = searchParams.get('message')
    const errorParam = searchParams.get('error')
    
    if (messageParam) {
      setMessage({ text: messageParam, type: 'success' })
      // Limpiar mensaje después de 5 segundos
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
    
    if (errorParam) {
      setMessage({ text: errorParam, type: 'error' })
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [params.tenant])

  const fetchProducts = async (page = 1, search = "") => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/${params.tenant}/products?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setCategories(data.categories || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setMessage({ text: "Error al cargar los productos", type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (productData: any) => {
    try {
      const response = await fetch(`/api/${params.tenant}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        setShowForm(false)
        setMessage({ text: "Producto creado correctamente", type: 'success' })
        fetchProducts() // Recargar productos
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ text: errorData.error || "Error al crear el producto", type: 'error' })
      }
    } catch (error) {
      console.error("Error creating product:", error)
      setMessage({ text: "Error de conexión al crear el producto", type: 'error' })
    }
  }

  const handleEditProduct = async (productId: string, productData: any) => {
    try {
      const response = await fetch(`/api/${params.tenant}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        setMessage({ text: "Producto actualizado correctamente", type: 'success' })
        fetchProducts() // Recargar productos
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ text: errorData.error || "Error al actualizar el producto", type: 'error' })
      }
    } catch (error) {
      console.error("Error updating product:", error)
      setMessage({ text: "Error de conexión al actualizar el producto", type: 'error' })
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/${params.tenant}/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ text: "Producto eliminado correctamente", type: 'success' })
        fetchProducts() // Recargar productos
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ text: errorData.error || "Error al eliminar el producto", type: 'error' })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setMessage({ text: "Error de conexión al eliminar el producto", type: 'error' })
    }
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
      {/* Mensajes de éxito/error */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-black">Productos</h1>
          <p className="text-gray-600 dark:text-black">Gestiona tu inventario de productos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          + Nuevo Producto
        </button>
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Crear Nuevo Producto
          </h2>
          <ProductForm 
            onSubmit={handleCreateProduct}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <ProductTable 
          products={products}
          categories={categories}
          pagination={pagination}
          onRefresh={fetchProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  )
}