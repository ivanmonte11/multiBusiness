// components/billing/PricingCard.tsx
import { ARGENTINA_PRICING } from '@/lib/pricing'
import { CheckIcon } from '@heroicons/react/24/outline'

interface PricingCardProps {
  planId: keyof typeof ARGENTINA_PRICING
  currentPlan?: string
  onSelectPlan: (planId: string) => void
  loading?: boolean
}

export function PricingCard({ planId, currentPlan, onSelectPlan, loading }: PricingCardProps) {
  const plan = ARGENTINA_PRICING[planId]
  const isCurrentPlan = currentPlan === planId
  const isRecommended = plan.recommended

  return (
    <div className={`relative rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${
      isRecommended 
        ? 'border-blue-500 ring-2 ring-blue-500' 
        : 'border-gray-200'
    } ${isCurrentPlan ? 'bg-blue-50' : 'bg-white'}`}>
      
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
            Más Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold">{plan.title}</h3>
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-3xl font-bold">${plan.price.toLocaleString('es-AR')}</span>
          <span className="ml-1 text-sm text-gray-500">/mes</span>
        </div>
        
        {planId !== 'ENTERPRISE' && (
          <p className="mt-2 text-sm text-gray-600">
            Hasta {plan.salesLimit.toLocaleString('es-AR')} ventas/mes
          </p>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <span className="ml-2 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelectPlan(planId)}
        disabled={isCurrentPlan || loading}
        className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${
          isCurrentPlan
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : isRecommended
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-800 text-white hover:bg-gray-900'
        }`}
      >
        {loading ? 'Procesando...' : isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
      </button>
    </div>
  )
}