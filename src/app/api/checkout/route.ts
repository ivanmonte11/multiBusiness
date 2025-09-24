import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { ARGENTINA_PRICING } from '@/lib/pricing'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})
//  Interface para preferenceData
interface PreferenceData {
  items: Array<{
    id: string
    title: string
    description: string
    quantity: number
    currency_id: string
    unit_price: number
  }>
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  notification_url: string
  metadata: {
    tenantId: string
    tenantSlug: string
    planId: string
    planInternalId: string
    type: string
  }
  auto_return?: 'approved'
}

//  CORREGIDO: Función para validar PlanType sin usar 'any'
function toPlanType(planId: string): 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
  //  Usar switch statement en lugar de includes con any
  switch (planId) {
    case 'TRIAL':
      return 'TRIAL'
    case 'BASIC':
      return 'BASIC'
    case 'PROFESSIONAL':
      return 'PROFESSIONAL'
    case 'ENTERPRISE':
      return 'ENTERPRISE'
    default:
      throw new Error(`Invalid plan type: ${planId}`)
  }
}

//  Alternativa con type guard (si prefieres este enfoque)
function isValidPlanType(planId: string): planId is 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
  return ['TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'].includes(planId)
}

function toPlanTypeWithGuard(planId: string): 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
  if (isValidPlanType(planId)) {
    return planId
  }
  throw new Error(`Invalid plan type: ${planId}`)
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, planId } = await request.json()

    if (!tenantId || typeof tenantId !== 'string') {
      return NextResponse.json(
        { error: 'tenantId es requerido' }, 
        { status: 400 }
      )
    }

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { error: 'planId es requerido' }, 
        { status: 400 }
      )
    }

    // Buscar por slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantId },
      include: { subscription: true }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Organización no encontrada' }, 
        { status: 404 }
      )
    }

    const plan = ARGENTINA_PRICING[planId as keyof typeof ARGENTINA_PRICING]
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no válido' }, 
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    //  Usar interface en lugar de any
    const preferenceData: PreferenceData = {
      items: [{
        id: plan.id,
        title: `${plan.title} - PrenderPOS`,
        description: `SaaS de Gestión MultiRubro | Suscripción mensual | ${plan.features.join(' | ')}`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: plan.price,
      }],
      back_urls: {
        success: `${baseUrl}/${tenant.slug}/billing/success`,
        failure: `${baseUrl}/${tenant.slug}/billing`,
        pending: `${baseUrl}/${tenant.slug}/billing`,
      },
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        planId: planId,
        planInternalId: plan.id,
        type: 'subscription'
      }
    }

    let preference
    
    try {
      preference = await new Preference(client).create({
        body: preferenceData
      })
    } catch (error: unknown) { //  CORREGIDO: Remover variable no usada 'firstError'
      console.log('First attempt failed, trying with auto_return...')
      
      // Si falla, intentar CON auto_return
      preferenceData.auto_return = 'approved'
      preference = await new Preference(client).create({
        body: preferenceData
      })
    }

    const checkoutUrl = preference.init_point

    //  Usar la función corregida sin 'any'
    await prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      update: { 
        mpPreferenceId: preference.id,
        plan: toPlanType(planId), 
        status: 'PENDING',
        price: plan.price
      },
      create: {
        tenantId: tenant.id,
        mpPreferenceId: preference.id,
        plan: toPlanType(planId), 
        status: 'PENDING',
        price: plan.price,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({ 
      checkoutUrl: checkoutUrl
    })

  } catch (error: unknown) {
    console.error('Error en checkout:', error)
    
    if (error instanceof Error && 'status' in error && 'error' in error) {
      const typedError = error as { status?: number; error?: string }
      if (typedError.status === 400 && typedError.error === 'invalid_auto_return') {
        return NextResponse.json(
          { error: 'Error de configuración con las URLs de retorno' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}