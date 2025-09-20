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
    console.log('🔍 Cancelar venta - Datos recibidos:', { saleId, tenantId })

    // BUSCAR TENANT POR SLUG EN LUGAR DE ID
    const tenant = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { id: tenantId },    // Buscar por ID
          { slug: tenantId }   // Buscar por slug
        ]
      }
    })
    console.log('🔍 Tenant encontrado:', tenant)

    if (!tenant) {
      // Mostrar todos los tenants para debug
      const allTenants = await prisma.tenant.findMany({
        select: { id: true, name: true, slug: true }
      })
      console.log('🔍 Todos los tenants:', allTenants)
      
      return NextResponse.json({ 
        error: 'Tenant no encontrado',
        debug: { tenantIdRequested: tenantId, allTenants } 
      }, { status: 404 })
    }

    // BUSCAR LA VENTA USANDO EL ID REAL DEL TENANT
    const sale = await prisma.sale.findFirst({
      where: { 
        id: saleId, 
        tenantId: tenant.id  
      },
      include: { items: true }
    })
    console.log('🔍 Venta encontrada:', sale ? `SÍ - ${sale.saleNumber}` : 'NO')

    // SI NO ENCUENTRA, MOSTRAR TODAS LAS VENTAS PARA DEBUG
    if (!sale) {
      const allSales = await prisma.sale.findMany({
        where: { tenantId: tenant.id },  // ← ¡CORREGIDO! Usar tenant.id
        select: { id: true, saleNumber: true, status: true }
      })
      console.log('🔍 Todas las ventas del tenant:', allSales)
      
      return NextResponse.json({ 
        error: 'Venta no encontrada',
        debug: {
          saleIdRequested: saleId,
          tenantIdRequested: tenantId,
          tenantIdUsed: tenant.id,  
          totalSalesInTenant: allSales.length,
          availableSales: allSales
        }
      }, { status: 404 })
    }

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

  } catch (error) {
    console.error('Error anulando venta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}