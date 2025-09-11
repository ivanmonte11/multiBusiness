"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import BarcodeScanner from "@/app/components/products/BarcodeScanner"

export default function ScanPage() {
  const params = useParams()
  const router = useRouter()
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  const handleScan = async (barcode: string) => {
    setScannedCode(barcode)
    
    // Buscar producto por código de barras
    try {
      const response = await fetch(`/api/${params.tenant}/products?search=${barcode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.products.length > 0) {
          router.push(`/${params.tenant}/products`)
        }
      }
    } catch (error) {
      console.error('Error searching product:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Escáner de Códigos de Barras</h1>
      <BarcodeScanner 
        onScan={handleScan}
        onClose={() => router.push(`/${params.tenant}/products`)}
      />
    </div>
  )
}