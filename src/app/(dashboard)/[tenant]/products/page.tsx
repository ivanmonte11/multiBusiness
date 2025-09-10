"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import ProductTable from "@/app/components/products/ProductTable"

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  barCode: string
  sku: string
  category: string
  createdAt: string
}

export default function ProductsPage() {
  const params = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/${params.tenant}/products`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [params.tenant])

  if (loading) {
    return <div>Cargando productos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href={`/${params.tenant}/products/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nuevo Producto
        </Link>
      </div>
      
      <ProductTable products={products} />
    </div>
  )
}