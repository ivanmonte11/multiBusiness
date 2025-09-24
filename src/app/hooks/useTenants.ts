"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface TenantData {
  id: string
  name: string
  slug: string
  planType: 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  trialEndsAt: string | null
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd: string
    price: number
  }
}

export function useTenant() {
  const { data: session } = useSession()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenant() {
      if (!session?.user?.tenant) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/${session.user.tenant}/tenant-info`)
        if (response.ok) {
          const data = await response.json()
          setTenant(data)
        } else {
          setError('Error al cargar datos del tenant')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [session])

  return { tenant, loading, error }
}