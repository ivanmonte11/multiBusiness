export interface User {
  id: string
  email: string
  name: string | null
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Tenant {
  id: string
  name: string
  slug: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  barCode: string | null
  sku: string | null
  category: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  tenant: string
}
export interface Sale {
  id: string
  saleNumber: string
  total: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'
  customerId?: string
  userId: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  cost: number
  quantity: number
  barCode: string
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