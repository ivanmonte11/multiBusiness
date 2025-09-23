import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PaymentMethod } from '@prisma/client' 

// Interfaces para tipado
interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

interface SaleRequest {
  items: SaleItem[]
  paymentMethod: PaymentMethod 
  paymentNote?: string
  customerId?: string
  total?: number
}

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
        user: true,
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
  } catch {
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
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: session.user.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body: SaleRequest = await request.json()
    console.log('📦 Sale data received:', body)

    // Validar datos requeridos
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    // Validar método de pago usando el enum
    const validPaymentMethods = Object.values(PaymentMethod)
    if (!body.paymentMethod || !validPaymentMethods.includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400 }
      )
    }

    if (body.paymentMethod === PaymentMethod.OTHER && !body.paymentNote) {
      return NextResponse.json(
        { error: "Payment note is required for other payment methods" },
        { status: 400 }
      )
    }

    // Calcular total
    const total = body.total || body.items.reduce((sum: number, item: SaleItem) => {
      return sum + (Number(item.unitPrice) * Number(item.quantity))
    }, 0)

    console.log('💰 Calculated total:', total)

    // Generar número de venta único
    const saleCount = await prisma.sale.count({
      where: { tenantId: tenant.id }
    })
    const saleNumber = `V-${(saleCount + 1).toString().padStart(6, '0')}`

    // Crear la venta - ahora paymentMethod es del tipo correcto
    const sale = await prisma.sale.create({
      data: {
        total: total,
        status: "COMPLETED",
        paymentMethod: body.paymentMethod, // ← Tipo correcto (PaymentMethod enum)
        paymentNote: body.paymentNote,
        customerId: body.customerId || null,
        tenantId: tenant.id,
        saleNumber: saleNumber,
        userId: session.user.id,
        items: {
          create: body.items.map((item: SaleItem) => ({
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

    // Actualizar stock de productos
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