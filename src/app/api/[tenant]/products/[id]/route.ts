import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== params.tenant) {
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

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        tenantId: tenant.id
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== params.tenant) {
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
    
    const product = await prisma.product.update({
      where: {
        id: params.id,
        tenantId: tenant.id
      },
      data: body
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== params.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: session.user.tenant }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    await prisma.product.delete({
      where: {
        id: params.id,
        tenantId: tenant.id
      }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    )
  }
}