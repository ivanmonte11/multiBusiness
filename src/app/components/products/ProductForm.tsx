"use client"

import { useState, useEffect } from "react" // ← Agregar useEffect
import BarcodeGenerator from "./BarcodeGenerator"
import BarcodeScanner from "./BarcodeScanner"

interface ProductData {
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
  createdAt?:string
  updatedAt?: string
}

interface ProductFormProps {
  onSubmit: (data: ProductData) => void
  onCancel?: () => void
  initialData?: Partial<ProductData>
  loading?: boolean
  isEdit?: boolean // ← Nueva prop para modo edición
}

export default function ProductForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  loading = false, 
  isEdit = false // ← Valor por defecto
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    quantity: 0,
    barCode: "",
    sku: "",
    category: "",
    image: "",
    weight: 0,
    dimensions: "",
    lowStockThreshold: 5,
    ...initialData
  })
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // Efecto para actualizar el formData cuando initialData cambie
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: ProductData) => ({
      ...prev,
      [name]: name === 'price' || name === 'cost' || name === 'weight' ? 
               parseFloat(value) || 0 : 
               name === 'quantity' || name === 'lowStockThreshold' ? 
               parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones adicionales para modo edición
    if (isEdit) {
      // Puedes agregar validaciones específicas para edición aquí
      if (!formData.name.trim()) {
        alert("El nombre del producto es requerido")
        return
      }
      if (formData.price <= 0) {
        alert("El precio debe ser mayor a 0")
        return
      }
    }
    
    onSubmit(formData)
  }

  const handleBarcodeGenerate = (barcode: string) => {
    setFormData(prev => ({ ...prev, barCode: barcode }))
    setShowBarcodeGenerator(false)
  }

  const handleBarcodeScan = (barcode: string) => {
    setFormData(prev => ({ ...prev, barCode: barcode }))
    setShowScanner(false)
  }

  // Clases CSS consistentes para inputs
  const inputClassName = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300"

  return (
    <>
      {/* Header con título dinámico */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {isEdit ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClassName}>
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClassName}>
                Descripción
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Descripción del producto"
              />
            </div>

            <div>
              <label htmlFor="category" className={labelClassName}>
                Categoría *
              </label>
              <input
                type="text"
                name="category"
                id="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Ej: Electrónicos, Ropa, Comida..."
              />
            </div>

            <div>
              <label htmlFor="image" className={labelClassName}>
                URL de la imagen
              </label>
              <input
                type="url"
                name="image"
                id="image"
                value={formData.image}
                onChange={handleChange}
                className={inputClassName}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    className="h-20 w-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className={labelClassName}>
                  Precio de venta *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="cost" className={labelClassName}>
                  Precio de costo
                </label>
                <input
                  type="number"
                  name="cost"
                  id="cost"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className={labelClassName}>
                  Cantidad en stock *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="0"
                />
                {formData.quantity <= formData.lowStockThreshold && formData.quantity > 0 && (
                  <p className="text-yellow-600 text-sm mt-1">
                    ⚠️ Stock bajo
                  </p>
                )}
                {formData.quantity === 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    ⚠️ Sin stock
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lowStockThreshold" className={labelClassName}>
                  Alerta de stock mínimo
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  id="lowStockThreshold"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="barCode" className={labelClassName}>
                Código de barras
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  name="barCode"
                  id="barCode"
                  value={formData.barCode}
                  onChange={handleChange}
                  className={inputClassName + " flex-1"}
                  placeholder="Código de barras"
                  readOnly={isEdit} // ← Hacer readonly en edición para evitar cambios accidentales
                />
                {!isEdit && ( // ← Solo mostrar botones en modo creación
                  <>
                    <button
                      type="button"
                      onClick={() => setShowBarcodeGenerator(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
                    >
                      Generar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap"
                    >
                      Escanear
                    </button>
                  </>
                )}
              </div>
              {isEdit && formData.barCode && (
                <p className="text-sm text-gray-500 mt-1">
                  El código de barras no puede ser modificado en edición
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sku" className={labelClassName}>
                SKU (Código Interno)
              </label>
              <input
                type="text"
                name="sku"
                id="sku"
                value={formData.sku}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Ej: ROP-CAM-NEG-M"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className={labelClassName}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="dimensions" className={labelClassName}>
                  Dimensiones
                </label>
                <input
                  type="text"
                  name="dimensions"
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="20x30x15 cm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de auditoría en modo edición */}
        {isEdit && initialData && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información de auditoría
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {initialData.createdAt ? new Date(initialData.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Última actualización:</span>{' '}
                {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
        </div>
      </form>

      {showBarcodeGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Generar Código de Barras
            </h3>
            <BarcodeGenerator 
              onBarcodeGenerate={handleBarcodeGenerate}
              initialValue={formData.barCode}
            />
            <button
              onClick={() => setShowBarcodeGenerator(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner 
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}