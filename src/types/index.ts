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