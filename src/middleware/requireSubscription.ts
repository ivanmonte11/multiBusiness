import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function requireActiveSubscription(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: token.tenantId as string },
      include: { subscription: true }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }

    // Si está en trial y expiró
    if (tenant.planType === 'TRIAL' && tenant.trialEndsAt && tenant.trialEndsAt < new Date()) {
      return NextResponse.json(
        { error: 'Trial expirado. Debes elegir un plan para continuar.' },
        { status: 402 }
      )
    }

    // Si está suspendido
    if (tenant.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Cuenta suspendida. Regulariza tu pago.' },
        { status: 402 }
      )
    }

    return tenant

  } catch (error) {
    console.error('Error en middleware de suscripción:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}