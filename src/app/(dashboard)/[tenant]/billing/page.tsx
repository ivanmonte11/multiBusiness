'use client'

import { useState } from 'react' // ✅ Removemos useEffect que no se usa
import { useParams } from 'next/navigation'
import { useTenant } from '@/app/hooks/useTenants'
import { PricingCard } from '@/app/components/billing/PricingCard'
import { ARGENTINA_PRICING } from '@/lib/pricing'

export default function BillingPage() {
  const params = useParams()
  const { tenant, loading: tenantLoading } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // ✅ Removemos tenantId que no se usa y usamos directamente params.tenant

  const handleSelectPlan = async (planId: string) => {
    const tenantSlug = params.tenant as string
    
    console.log('🔄 handleSelectPlan called with:', { 
      tenantSlug,
      planId
    })

    if (!tenantSlug) {
      setMessage({ type: 'error', text: 'No se pudo identificar la organización' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: tenantSlug,
          planId: planId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Checkout response:', data)
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No se recibió URL de checkout')
      }

    } catch (error: unknown) { 
      console.error('Error en checkout:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al procesar la solicitud' 
      })
    } finally {
      setLoading(false)
    }
  }

  const daysLeft = tenant?.trialEndsAt 
    ? Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  if (tenantLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planes y Facturación</h1>
        <p className="mt-2 text-lg text-gray-600">
          Elige el plan que mejor se adapte a tu negocio
        </p>
      </div>

      {/* Alertas */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {tenant?.planType === 'TRIAL' && daysLeft > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">⏰</div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Trial activo:</strong> Tienes {daysLeft} días restantes para elegir un plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {tenant?.status === 'SUSPENDED' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Cuenta suspendida:</strong> Tu suscripción ha expirado. 
                Regulariza el pago para reactivar tu cuenta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info del Plan Actual */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Plan Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Plan</label>
            <p className="text-lg font-semibold capitalize">{tenant?.planType?.toLowerCase()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <p className="text-lg font-semibold capitalize">{tenant?.status?.toLowerCase()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              {tenant?.planType === 'TRIAL' ? 'Trial expira' : 'Próxima facturación'}
            </label>
            <p className="text-lg font-semibold">
              {tenant?.planType === 'TRIAL' 
                ? new Date(tenant.trialEndsAt!).toLocaleDateString('es-AR')
                : tenant?.subscription?.currentPeriodEnd 
                  ? new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString('es-AR')
                  : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Planes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(Object.keys(ARGENTINA_PRICING) as Array<keyof typeof ARGENTINA_PRICING>).map((planId) => (
          <PricingCard
            key={planId}
            planId={planId}
            currentPlan={tenant?.planType}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      {/* Información de Pagos */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">💳 Pagos seguros con Mercado Pago</h3>
          <p className="text-gray-600">
            Todos los pagos son procesados de forma segura. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
}