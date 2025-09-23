import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { saleId, tenantId } = await request.json()
    console.log('🔍 Crear devolución - Datos recibidos:', { saleId, tenantId })

    // BUSCAR TENANT POR SLUG O ID
    const tenant = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { id: tenantId },
          { slug: tenantId }
        ]
      }
    })
    console.log('🔍 Tenant encontrado:', tenant)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }

    // Verificar que la venta existe y está COMPLETED
    const sale = await prisma.sale.findFirst({
      where: { 
        id: saleId, 
        tenantId: tenant.id,
        status: 'COMPLETED'
      },
      include: { items: true }
    })

    if (!sale) {
      return NextResponse.json({ 
        error: 'Venta no encontrada o no válida para devolución' 
      }, { status: 404 })
    }

    // Crear número de devolución
    const refundNumber = `DEV-${Date.now()}`

    // Crear la devolución
    const refund = await prisma.$transaction(async (tx) => {
      //  Crear registro de devolución
      const refund = await tx.refund.create({
        data: {
          refundNumber,
          saleId: saleId,
          total: Number(sale.total), 
          status: 'COMPLETED',
          tenantId: tenant.id,
          items: {
            create: sale.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice), 
              subtotal: Number(item.subtotal)    
            }))
          }
        }
      })

      //  Revertir stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } }
        })
      }

      //  Marcar venta como devuelta
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'REFUNDED' }
      })

      return refund
    })

    return NextResponse.json({ 
      message: 'Devolución creada exitosamente',
      refundId: refund.id,
      refundNumber: refund.refundNumber
    })

  } catch (error) {
    console.error('Error creando devolución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}