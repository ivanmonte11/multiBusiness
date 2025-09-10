import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== params.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Primero obtener el tenant para conseguir el ID
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: session.user.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.tenant !== params.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Primero obtener el tenant para conseguir el ID
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: session.user.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        ...body,
        tenantId: tenant.id
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    )
  }
}