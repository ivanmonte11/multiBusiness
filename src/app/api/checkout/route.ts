import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { ARGENTINA_PRICING } from '@/lib/pricing'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

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
  auto_return: 'approved'
}

// Interface para el error de MercadoPago
interface MercadoPagoError {
  status?: number
  error?: string
  message?: string
}

function toPlanType(planId: string): 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL no está configurado')
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

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
      },
      auto_return: 'approved'
    }

    let preference
    
    try {
      preference = await new Preference(client).create({
        body: preferenceData
      })
    } catch (error: unknown) {
      console.error('Error creando preferencia:', error)
      
      // Si falla, intentar SIN auto_return como fallback
      const { auto_return, ...preferenceDataWithoutAutoReturn } = preferenceData
      
      preference = await new Preference(client).create({
        body: preferenceDataWithoutAutoReturn
      })
    }

    const checkoutUrl = preference.init_point || preference.sandbox_init_point

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
    
    // Manejo específico de errores de MercadoPago
    const mercadoPagoError = error as MercadoPagoError
    if (mercadoPagoError.status === 400) {
      return NextResponse.json(
        { error: 'Error en la configuración del pago' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    )
  }
}