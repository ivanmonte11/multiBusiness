"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CreditCardIcon,
  ArrowRightCircleIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  barCode?: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface SaleFormProps {
  onSubmit: (data: {
    customerId: string | null
    paymentMethod: "CASH" | "CARD" | "TRANSFER" | "OTHER"
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      subtotal: number
    }>
    total: number
    transferReference?: string
    transferBank?: string
    paymentNote?: string
  }) => void
  onCancel: () => void
  loading?: boolean
}

export default function SaleForm({ onSubmit, onCancel, loading = false }: SaleFormProps) {
  const params = useParams() as { tenant: string }
  const [items, setItems] = useState<SaleItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER" | "OTHER">("CASH")
  const [paymentNote, setPaymentNote] = useState("")
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  })


  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true)
      const response = await fetch(`/api/${params.tenant}/products`)
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API response:', data)

        const productsArray = Array.isArray(data) ? data : data.products || []
        console.log('✅ Products array:', productsArray)

        setProducts(productsArray)
      } else {
        console.error("Error en la respuesta:", response.status)
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [params.tenant])

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/${params.tenant}/customers`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(Array.isArray(data) ? data : [])
      } else {
        console.error("Error en la respuesta:", response.status)
        setCustomers([])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      setCustomers([])
    }
  }, [params.tenant])

  useEffect(() => {
    if (params.tenant) {
      fetchProducts()
      fetchCustomers()
    }
  }, [params.tenant, fetchProducts, fetchCustomers])

 
  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      updateItemQuantity(product.id, newQuantity)
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: Number(product.price),
        subtotal: Number(product.price)
      }
      setItems([...items, newItem])
    }
    setSearchTerm("")
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(items.map(item =>
      item.productId === productId
        ? {
          ...item,
          quantity,
          subtotal: quantity * item.unitPrice
        }
        : item
    ))
  }

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  const filteredProducts = (products || []).filter(product => {
    if (!searchTerm.trim()) return false

    const searchTermLower = searchTerm.toLowerCase().trim()
    const productName = (product.name || '').toLowerCase()
    const productBarCode = (product.barCode || '').toLowerCase()

    return (
      productName.includes(searchTermLower) ||
      productBarCode.includes(searchTermLower)
    )
  })

  const handleSubmit = () => {
    if (items.length === 0) {
      alert("Agrega al menos un producto a la venta")
      return
    }

    if (paymentMethod === "OTHER" && !paymentNote.trim()) {
      alert("Por favor especifica el método de pago")
      return
    }

    const saleData = {
      customerId: selectedCustomer || null,
      paymentMethod,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      })),
      total: getTotal(),
      ...(paymentMethod === "OTHER" && {
        paymentNote: paymentNote.trim()
      })
    }

    console.log("📦 Datos de la venta:", saleData)
    onSubmit(saleData)
  }

  const handleAddCustomer = async () => {
    try {
      const response = await fetch(`/api/${params.tenant}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer)
      })

      if (response.ok) {
        const customer = await response.json()
        setSelectedCustomer(customer.id)
        setShowCustomerModal(false)
        setNewCustomer({ name: '', email: '', phone: '' })
        fetchCustomers() // Recargar clientes
      } else {
        alert('Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Selección de Cliente */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Agregar Cliente Rápido</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={!newCustomer.name.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
                >
                  Agregar
                </button>
                {selectedCustomer && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Cliente seleccionado ✓
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>

          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Cliente ocasional</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.email && `(${customer.email})`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCustomerModal(true)}
            className="flex-1 bg-indigo-600 text-white py-1 px-3 rounded-md text-sm hover:bg-indigo-700 flex items-center justify-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Cliente
          </button>
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Efectivo */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-3 rounded-md border flex flex-col items-center justify-center transition-all ${paymentMethod === "CASH"
                ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <BanknotesIcon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Efectivo</span>
            </button>

            {/* Tarjeta */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`p-3 rounded-md border flex flex-col items-center justify-center transition-all ${paymentMethod === "CARD"
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <CreditCardIcon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Tarjeta</span>
            </button>

            {/* Transferencia (general) */}
            <button
              type="button"
              onClick={() => setPaymentMethod("TRANSFER")}
              className={`p-3 rounded-md border flex flex-col items-center justify-center transition-all ${paymentMethod === "TRANSFER"
                ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <ArrowRightCircleIcon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Transferencia</span>
              <span className="text-xs text-gray-500">(Bancos/Billeteras)</span>
            </button>

            {/* Otro */}
            <button
              type="button"
              onClick={() => setPaymentMethod("OTHER")}
              className={`p-3 rounded-md border flex flex-col items-center justify-center transition-all ${paymentMethod === "OTHER"
                ? "border-gray-500 bg-gray-50 text-gray-700 shadow-md"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <QuestionMarkCircleIcon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Otro</span>
            </button>
          </div>

          {/* Solo campo para "Otro" */}
          {paymentMethod === "OTHER" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificar método de pago
              </label>
              <input
                type="text"
                placeholder="Ej: Canje, Fiado, Cupón, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Búsqueda de Productos */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Producto
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Buscar por nombre o código de barras..."
          />
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
            {productsLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                Buscando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
  No se encontraron productos para &ldquo;{searchTerm}&rdquo;
</div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addItem(product)}
                  className={`p-3 border-b border-gray-100 cursor-pointer flex justify-between items-center ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  title={product.quantity === 0 ? 'Sin stock' : ''}
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(product.price).toLocaleString()} -
                      Stock: {product.quantity}
                      {product.quantity === 0 && (
                        <span className="text-red-600 ml-2">(Agotado)</span>
                      )}
                    </div>
                  </div>
                  {product.quantity > 0 && (
                    <PlusIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Items de la Venta */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Productos en la venta</h3>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos en la venta</p>
            <p className="text-sm">Busca y agrega productos arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-gray-600">${item.unitPrice.toLocaleString()} c/u</div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-20 text-right font-medium">
                    ${item.subtotal.toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total y Acciones */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-gray-900">
            Total: ${getTotal().toLocaleString()}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Finalizar Venta"}
          </button>
        </div>
      </div>
    </div>
  )
}