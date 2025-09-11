"use client"

import { useState, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeGeneratorProps {
  onBarcodeGenerate: (barcode: string) => void
  initialValue?: string
}

export default function BarcodeGenerator({ onBarcodeGenerate, initialValue = '' }: BarcodeGeneratorProps) {
  const [barcodeValue, setBarcodeValue] = useState(initialValue)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateBarcode = () => {
    if (!barcodeValue.trim()) return

    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, barcodeValue, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 16,
          background: '#ffffff',
          lineColor: '#000000'
        })
        onBarcodeGenerate(barcodeValue)
      } catch (error) {
        console.error('Error generating barcode:', error)
      }
    }
  }

  const generateRandomBarcode = () => {
    const randomBarcode = 'BC' + Date.now() + Math.floor(Math.random() * 1000)
    setBarcodeValue(randomBarcode)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg">Generador de Código de Barras</h3>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={barcodeValue}
          onChange={(e) => setBarcodeValue(e.target.value)}
          placeholder="Ingresa código o genera automático"
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          onClick={generateRandomBarcode}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Generar
        </button>
        <button
          onClick={generateBarcode}
          disabled={!barcodeValue}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          Aplicar
        </button>
      </div>

      {barcodeValue && (
        <div className="text-center">
          <canvas ref={canvasRef} />
          <p className="text-sm text-gray-600 mt-2">Código: {barcodeValue}</p>
        </div>
      )}
    </div>
  )
}