// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, tenantName, tenantCategory } = body

    // Validaciones básicas
    if (!email || !password || !name || !tenantName || !tenantCategory) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      )
    }

    // Verificar si el tenant (slug) ya existe
    const tenantSlug = tenantName.toLowerCase().replace(/\s+/g, '-')
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: "El nombre de negocio ya está en uso" },
        { status: 400 }
      )
    }

    // CREAR TENANT CON TRIAL DE 14 DÍAS
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días
    
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        category: tenantCategory,
        planType: 'TRIAL',
        status: 'ACTIVE',
        trialEndsAt: trialEndsAt
      }
    })

    // Hashear la contraseña
    const hashedPassword = await hash(password, 12)

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tenantId: tenant.id
      }
    })

    // CREAR SUBSCRIPCIÓN INICIAL (TRIAL)
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: 'TRIAL',
        status: 'ACTIVE',
        price: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt
      }
    })

    return NextResponse.json({
      message: "Usuario creado exitosamente. Trial de 14 días activado.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        trialEndsAt: tenant.trialEndsAt
      },
      trialEndsAt: trialEndsAt
    })

  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}