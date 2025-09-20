import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { tenant } = await params

    // Buscar tenant por slug
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant }
    })

    if (!tenantData) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    // Obtener clientes con estadísticas de ventas
    const customers = await prisma.customer.findMany({
      where: {
        tenantId: tenantData.id
      },
      include: {
        _count: {
          select: {
            sales: true
          }
        },
        sales: {
          select: {
            total: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Formatear datos con estadísticas
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt.toISOString(),
      salesCount: customer._count.sales,
      totalSpent: customer.sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    }))

    return NextResponse.json(formattedCustomers)

  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { tenant } = await params
    const body = await request.json()

    // Validaciones
    if (!body.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    // Buscar tenant
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant }
    })

    if (!tenantData) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    // Crear cliente
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        tenantId: tenantData.id
      }
    })

    return NextResponse.json(customer)

  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}