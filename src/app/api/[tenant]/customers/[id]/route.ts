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

    // Buscar cliente con sus ventas COMPLETAS
    const customer = await prisma.customer.findFirst({
      where: {
        id: id,
        tenantId: tenantData.id
      },
      include: {
        sales: {
          where: {
            status: 'COMPLETED'
          },
          include: {  // ← Cambia select por include para obtener todos los datos
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
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Calcular estadísticas
    const salesCount = customer.sales.length
    const totalSpent = customer.sales.reduce((sum, sale) => {
      const saleTotal = sale.total ? Number(sale.total) : 0
      return sum + saleTotal
    }, 0)

    // Formatear las ventas para el frontend
    const formattedSales = customer.sales.map(sale => ({
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

    // Devolver el objeto completo CON las ventas
    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      salesCount,
      totalSpent,
      sales: formattedSales  // ← ¡Esto es lo que falta!
    })

  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: 'Error fetching customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verificar si el cliente existe y pertenece al tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: id,
        tenantId: tenantData.id
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Eliminar cliente
    await prisma.customer.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Cliente eliminado correctamente" })

  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { tenant, id } = await params
    const body = await request.json()

    // Buscar tenant
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant }
    })

    if (!tenantData) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    // Verificar que el cliente existe y pertenece al tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
        tenantId: tenantData.id
      }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Actualizar cliente
    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address
      }
    })

    return NextResponse.json(updatedCustomer)

  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    )
  }
}