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

    const sale = await prisma.sale.findUnique({
      where: {
        id: resolvedParams.id,
        tenantId: tenant.id
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error fetching sale:", error)
    return NextResponse.json(
      { error: "Error fetching sale" },
      { status: 500 }
    )
  }
}