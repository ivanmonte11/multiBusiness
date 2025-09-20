import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { tenant } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 })
    }

    console.log('🔍 Generating report for:', { tenant, startDate, endDate })

    // 1. PRIMERO BUSCAR EL TENANT POR SLUG (como en tu API)
    const tenantData = await prisma.tenant.findUnique({
      where: { 
        slug: tenant // ← ¡CORRECCIÓN IMPORTANTE! Buscar por slug, no por id
      }
    })

    if (!tenantData) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }

    console.log('✅ Tenant encontrado:', tenantData.id)

    // 2. Obtener ventas del período usando el ID del tenant
    const sales = await prisma.sale.findMany({
      where: {
        tenantId: tenantData.id, // ← Usar el ID del tenant encontrado
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('📊 Ventas encontradas:', sales.length)

    // 3. Cálculos de métricas
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
    
    // Contar clientes únicos (excluyendo nulls)
    const customerIds = sales.map(sale => sale.customerId).filter(id => id !== null)
    const totalCustomers = new Set(customerIds).size

    // 4. Ventas por método de pago
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const existing = acc.find(item => item.method === sale.paymentMethod)
      if (existing) {
        existing.amount += Number(sale.total)
        existing.count += 1
      } else {
        acc.push({
          method: sale.paymentMethod,
          amount: Number(sale.total),
          count: 1
        })
      }
      return acc
    }, [] as { method: string; amount: number; count: number }[])

    // 5. Ventas por estado
    const salesByStatus = sales.reduce((acc, sale) => {
      const existing = acc.find(item => item.status === sale.status)
      if (existing) {
        existing.amount += Number(sale.total)
        existing.count += 1
      } else {
        acc.push({
          status: sale.status,
          amount: Number(sale.total),
          count: 1
        })
      }
      return acc
    }, [] as { status: string; amount: number; count: number }[])

    // 6. Productos más vendidos
    const topProducts = sales.flatMap(sale => sale.items).reduce((acc, item) => {
      const existing = acc.find(p => p.product === item.product.name)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += Number(item.subtotal)
      } else {
        acc.push({
          product: item.product.name,
          quantity: item.quantity,
          revenue: Number(item.subtotal)
        })
      }
      return acc
    }, [] as { product: string; quantity: number; revenue: number }[]).sort((a, b) => b.quantity - a.quantity).slice(0, 10)

    return NextResponse.json({
      totalSales,
      totalRevenue,
      averageTicket,
      totalCustomers,
      salesByPaymentMethod,
      salesByStatus,
      topProducts,
      period: { start: startDate, end: endDate }
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}