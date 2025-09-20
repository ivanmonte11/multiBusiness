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
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug: resolvedParams.tenant
      },
      select: {
        name: true,
        slug: true,
        phone: true, 
        email: true,
        address: true,
        taxId: true
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Error fetching tenant info:", error)
    return NextResponse.json(
      { error: "Error fetching tenant info" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
        slug: resolvedParams.tenant
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, phone, email, address, taxId } = body

    // Actualizar todos los campos
    const updatedTenant = await prisma.tenant.update({
      where: {
        slug: resolvedParams.tenant
      },
      data: {
        name: name || tenant.name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        taxId: taxId || null
      },
      select: {
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        taxId: true
      }
    })

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error("Error updating tenant:", error)
    return NextResponse.json(
      { error: "Error updating tenant" },
      { status: 500 }
    )
  }
}