// app/(dashboard)/[tenant]/billing/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function SuccessPage() {
  const params = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(`/${params.tenant}/dashboard`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, params.tenant])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu suscripción ha sido activada correctamente. 
          Ahora tienes acceso completo a todas las funciones.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            Serás redirigido al dashboard en {countdown} segundos...
          </p>
        </div>

        <button
          onClick={() => router.push(`/${params.tenant}/dashboard`)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Ir al Dashboard Ahora
        </button>
      </div>
    </div>
  )
}