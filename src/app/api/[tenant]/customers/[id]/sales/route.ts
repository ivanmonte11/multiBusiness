import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { tenant, id } = await params

    // Buscar tenant
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant }
    })

    if (!tenantData) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    // Buscar ventas del cliente
    const sales = await prisma.sale.findMany({
      where: {
        customerId: id,
        tenantId: tenantData.id,
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear la respuesta
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      total: Number(sale.total),
      status: sale.status,
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt.toISOString(),
      items: sale.items.map(item => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        product: {
          name: item.product.name
        }
      }))
    }))

    return NextResponse.json(formattedSales)

  } catch (error) {
    console.error("Error fetching customer sales:", error)
    return NextResponse.json(
      { error: 'Error fetching sales' },
      { status: 500 }
    )
  }
}