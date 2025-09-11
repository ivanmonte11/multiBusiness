// src/app/api/[tenant]/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> } // ← params es Promise
) {
  // Await de los params
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== resolvedParams.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Obtener el tenant para conseguir el ID
    const tenant = await prisma.tenant.findUnique({
      where: { slug: session.user.tenant }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // ... el resto del código igual ...
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Construir where clause
    const where: any = {
      tenantId: tenant.id,
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barCode: { contains: search } },
        { sku: { contains: search } }
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { tenantId: tenant.id },
        select: { category: true },
        distinct: ['category']
      })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categories: Array.from(new Set(categories.map(c => c.category))).sort()
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> } // ← params es Promise
) {
  // Await de los params
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== resolvedParams.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: session.user.tenant }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        ...body,
        price: parseFloat(body.price),
        cost: body.cost ? parseFloat(body.cost) : null,
        quantity: parseInt(body.quantity),
        lowStockThreshold: parseInt(body.lowStockThreshold) || 5,
        tenantId: tenant.id
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    )
  }
}