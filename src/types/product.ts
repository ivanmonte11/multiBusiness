// types/product.ts
export interface ProductFormData {
  name: string
  description: string
  price: number
  cost: number
  quantity: number
  barCode: string // ← Este campo debe estar presente
  sku: string
  category: string
  image: string
  weight: number
  dimensions: string
  lowStockThreshold: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}