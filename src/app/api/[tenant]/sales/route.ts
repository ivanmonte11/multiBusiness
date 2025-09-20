// src/app/api/[tenant]/sales/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> } // ← params es una Promise
) {
  const resolvedParams = await params // ← Esperar los parámetros
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

    const sales = await prisma.sale.findMany({
      where: {
        tenantId: tenant.id
      },
      include: {
        customer: true,
        user:true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching sales" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  console.log('🛒 Creating sale for tenant:', resolvedParams.tenant)
  
  if (!session || session.user.tenant !== resolvedParams.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Obtener el tenant
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: session.user.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body = await request.json()
    console.log('📦 Sale data received:', body)

    // Validar datos requeridos
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    // Validar método de pago
    const validPaymentMethods = ["CASH", "CARD", "TRANSFER", "OTHER"]
    if (!body.paymentMethod || !validPaymentMethods.includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400 }
      )
    }

    if (body.paymentMethod === "OTHER" && !body.paymentNote) {
      return NextResponse.json(
        { error: "Payment note is required for other payment methods" },
        { status: 400 }
      )
    }

    // Calcular total
    const total = body.total || body.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.unitPrice) * Number(item.quantity))
    }, 0)

    console.log('💰 Calculated total:', total)

    // Generar número de venta único
    const saleCount = await prisma.sale.count({
      where: { tenantId: tenant.id }
    })
    const saleNumber = `V-${(saleCount + 1).toString().padStart(6, '0')}`

    // Crear la venta
    const sale = await prisma.sale.create({
      data: {
        total: total,
        status: "COMPLETED",
        paymentMethod: body.paymentMethod,
        paymentNote: body.paymentNote, // Solo para "OTHER"
        customerId: body.customerId || null,
        tenantId: tenant.id,
        saleNumber: saleNumber,
        userId: session.user.id,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal || (item.unitPrice * item.quantity),
          }))
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

    console.log('✅ Sale created:', sale)

    // Actualizar stock de productos y verificar que no queden negativos
    for (const item of body.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        console.warn(`⚠️ Product not found: ${item.productId}`)
        continue
      }

      const newQuantity = product.quantity - item.quantity
      
      if (newQuantity < 0) {
        console.warn(`⚠️ Negative stock for product: ${product.name}`)
        // Puedes decidir si quieres permitir stock negativo o no
      }

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('❌ Error creating sale:', error)
    return NextResponse.json(
      { error: "Error creating sale" },
      { status: 500 }
    )
  }
}