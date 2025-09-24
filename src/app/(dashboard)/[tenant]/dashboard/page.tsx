import Link from 'next/link'
import { useTenant } from '@/app/hooks/useTenants'

export default function DashboardPage() {
  const { tenant } = useTenant()
  

  if (!tenant) {
    console.warn('Tenant is null or undefined')
    return null
  }

  if (!tenant.trialEndsAt) {
    console.warn('Tenant trialEndsAt is not set')
    return null
  }

  // Validar que trialEndsAt sea una fecha válida
  const trialEndsAtDate = new Date(tenant.trialEndsAt)
  if (isNaN(trialEndsAtDate.getTime())) {
    console.error('Invalid trialEndsAt date:', tenant.trialEndsAt)
    return null
  }

  //  Cálculo seguro de días restantes
  const now = new Date()
  const timeDiff = trialEndsAtDate.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return null // Trial ya expiró
  }

  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  //  Mostrar solo si está en TRIAL y días restantes son positivos
  if (tenant.planType === 'TRIAL' && daysLeft > 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">⏰</div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Trial activo:</strong> {daysLeft} días restantes. 
              <Link 
                href={`/${tenant.slug}/billing`} 
                className="underline ml-2 hover:text-yellow-800"
              >
                Elegir plan
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}