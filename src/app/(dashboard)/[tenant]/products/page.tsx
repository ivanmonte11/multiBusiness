"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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

export default function ProductsPage() {
  const params = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

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
        fetchProducts() // Recargar productos
      }
    } catch (error) {
      console.error("Error creating product:", error)
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
        />
      )}
    </div>
  )
}