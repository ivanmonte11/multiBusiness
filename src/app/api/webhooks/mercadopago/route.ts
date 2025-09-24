import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

//  Interface para metadata del pago
interface PaymentMetadata {
  tenantId: string
  planId: string
  tenantSlug?: string
  planInternalId?: string
  type?: string
}

//  CORREGIDO: Función para validar PlanType sin usar 'any'
function toPlanType(planId: string): 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
  const validPlanTypes: readonly string[] = ['TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']
  
  //  Usar type guard en lugar de 'any'
  if (validPlanTypes.includes(planId)) {
    return planId as 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  }
  throw new Error(`Invalid plan type: ${planId}`)
}

//  Alternativa aún más type-safe:
function toPlanTypeSafe(planId: string): 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' {
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
    const body = await request.json()

    //  Validar estructura del webhook
    if (body.type !== 'payment' || !body.data?.id) {
      console.error('Invalid webhook structure:', body)
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400 })
    }

    const paymentId = body.data.id
    
    // Obtener detalles del pago
    const payment = await new Payment(client).get({ id: paymentId })
    
    //  Validaciones exhaustivas del pago
    if (!payment?.id) {
      console.error('Payment ID is undefined:', payment)
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 })
    }
    
    if (!payment.metadata) {
      console.error('Payment missing metadata:', payment)
      return NextResponse.json({ error: 'Payment metadata missing' }, { status: 400 })
    }
    
    if (payment.status === 'approved') {
      const metadata = payment.metadata as PaymentMetadata
      const { tenantId, planId } = metadata

      if (!tenantId || !planId) {
        console.error('Metadata missing tenantId or planId:', metadata)
        return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
      }

      //  Usar la versión type-safe
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          planType: toPlanTypeSafe(planId), 
          status: 'ACTIVE',
          subscription: {
            update: {
              status: 'ACTIVE',
              mpSubscriptionId: payment.id.toString(),
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      })

      console.log(`✅ Suscripción activada para tenant ${tenantId}, plan ${planId}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}