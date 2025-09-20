"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function SettingsPage() {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    taxId: ""
  })

  useEffect(() => {
    fetchTenantInfo()
  }, [params.tenant])

  const fetchTenantInfo = async () => {
    try {
      const response = await fetch(`/api/${params.tenant}/tenant-info`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          taxId: data.taxId || ""
        })
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/${params.tenant}/tenant-info`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert("Configuración guardada correctamente ✅")
      } else {
        alert("Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración Básica</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        {/* Nombre del Negocio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del Negocio *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: Mi Negocio"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Teléfono de Contacto
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: 11-2345-6789"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email de Contacto
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: contacto@minegocio.com"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: Av. Siempre Viva 123"
          />
        </div>

        {/* CUIT/CUIL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            CUIT/CUIL
          </label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: 20-12345678-9"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Configuración"}
        </button>
      </form>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800">💡 Información importante</h3>
        <p className="text-yellow-700 text-sm mt-1">
          Estos datos aparecerán en tus tickets y comprobantes. El CUIT es necesario para facturas.
        </p>
      </div>
    </div>
  )
}