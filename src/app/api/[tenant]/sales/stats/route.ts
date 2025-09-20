// src/app/api/[tenant]/sales/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== resolvedParams.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Obtener el tenant para conseguir el ID
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: session.user.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Estadísticas de ventas
    const totalSales = await prisma.sale.count({
      where: { tenantId: tenant.id }
    })

    const totalRevenue = await prisma.sale.aggregate({
      where: { tenantId: tenant.id },
      _sum: { total: true }
    })

    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    
    const todaySales = await prisma.sale.count({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfToday }
      }
    })

    const todayRevenue = await prisma.sale.aggregate({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfToday }
      },
      _sum: { total: true }
    })

    // Ventas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const salesByMonth = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        tenantId: tenant.id,
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { total: true },
      _count: { id: true }
    })

    const stats = {
      totalSales,
      totalRevenue: totalRevenue._sum.total || 0,
      todaySales,
      todayRevenue: todayRevenue._sum.total || 0,
      averageSale: totalSales > 0 ? Number(totalRevenue._sum.total) / totalSales : 0,
      salesByMonth: salesByMonth.map(sale => ({
        month: sale.createdAt.toISOString().slice(0, 7),
        revenue: Number(sale._sum.total),
        count: sale._count.id
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching sales stats:", error)
    return NextResponse.json(
      { error: "Error fetching sales statistics" },
      { status: 500 }
    )
  }
}