import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> } 
) {
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

    const product = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id, 
        tenantId: tenant.id
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
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

    // Verificar que el producto pertenezca al tenant
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: resolvedParams.id, 
        tenantId: tenant.id 
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id: resolvedParams.id }, 
      data: {
        ...body,
        price: body.price ? parseFloat(body.price) : undefined,
        cost: body.cost ? parseFloat(body.cost) : undefined,
        quantity: body.quantity ? parseInt(body.quantity) : undefined,
        lowStockThreshold: body.lowStockThreshold ? parseInt(body.lowStockThreshold) : undefined
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
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

    // Verificar que el producto pertenezca al tenant
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: resolvedParams.id, 
        tenantId: tenant.id 
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.update({
      where: { id: resolvedParams.id }, 
      data: { isActive: false }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    )
  }
}