import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action, saleId, tenantId } = await request.json()

    if (!action || !saleId || !tenantId) {
      return NextResponse.json({ error: 'Datos faltantes' }, { status: 400 })
    }

    // Verificar que la venta existe
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true }
    })

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    // ANULAR VENTA
    if (action === 'cancel') {
      if (sale.status === 'CANCELLED') {
        return NextResponse.json({ error: 'La venta ya está anulada' }, { status: 400 })
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedSale = await tx.sale.update({
          where: { id: saleId },
          data: { status: 'CANCELLED' }
        })

        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } }
          })
        }

        return updatedSale
      })

      return NextResponse.json({ 
        message: 'Venta anulada exitosamente',
        sale: result 
      })
    }

    // CREAR DEVOLUCIÓN
    if (action === 'refund') {
      if (sale.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Venta no válida para devolución' }, { status: 400 })
      }

      const refundNumber = `DEV-${Date.now()}`
      
      // Convertir Decimal a number para el total
      const totalNumber = Number(sale.total)

      const refund = await prisma.$transaction(async (tx) => {
        const refund = await tx.refund.create({
          data: {
            refundNumber,
            saleId,
            total: totalNumber, // Usar number en lugar de Decimal
            status: 'COMPLETED',
            tenantId,
            items: {
              create: sale.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice), // Convertir Decimal
                subtotal: Number(item.subtotal) // Convertir Decimal
              }))
            }
          }
        })

        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } }
          })
        }

        // Usar el enum correcto para el status
        await tx.sale.update({
          where: { id: saleId },
          data: { status: 'CANCELLED' } // Este debe ser un valor del enum SaleStatus
        })

        return refund
      })

      return NextResponse.json({ 
        message: 'Devolución creada exitosamente',
        refundId: refund.id,
        refundNumber: refund.refundNumber
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error en acción de venta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}