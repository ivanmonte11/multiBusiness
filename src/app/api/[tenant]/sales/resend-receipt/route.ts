import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { saleId, tenantId } = await request.json()
    console.log('🔍 Reenviar comprobante - Datos recibidos:', { saleId, tenantId })

    // BUSCAR TENANT POR SLUG O ID
    const tenant = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { id: tenantId },
          { slug: tenantId }
        ]
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }

    // Obtener venta con toda la información necesaria
    const sale = await prisma.sale.findFirst({
      where: { 
        id: saleId, 
        tenantId: tenant.id 
      },
      include: {
        customer: true,
        items: { 
          include: { 
            product: true 
          } 
        },
        user: true
      }
    })

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    if (sale.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'No se puede reenviar comprobante de una venta anulada' 
      }, { status: 400 })
    }

    // Formatear fecha y hora
    const saleDate = new Date(sale.createdAt)
    const formattedDate = saleDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const formattedTime = saleDate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Generar mensaje para WhatsApp
    const whatsappMessage = `
¡Hola! 👋 

*${tenant.name}* te envía tu comprobante:

📋 *Comprobante:* #${sale.saleNumber}
📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}
💰 *Total:* $${Number(sale.total).toLocaleString('es-AR')}

📦 *Productos:*
${sale.items.map(item => `• ${item.quantity} x ${item.product.name} - $${Number(item.unitPrice).toLocaleString('es-AR')}`).join('\n')}

💳 *Método de pago:* ${sale.paymentMethod}
${sale.paymentNote ? `📝 *Detalles:* ${sale.paymentNote}` : ''}

👤 *Vendedor:* ${sale.user.name}

¡Gracias por tu compra! 🎉
${tenant.phone ? `\n📞 *Teléfono:* ${tenant.phone}` : ''}
${tenant.address ? `📍 *Dirección:* ${tenant.address}` : ''}
    `.trim()

    return NextResponse.json({
      message: 'Datos listos para reenvío',
      data: {
        sale: {
          id: sale.id,
          saleNumber: sale.saleNumber,
          total: sale.total,
          createdAt: sale.createdAt,
          paymentMethod: sale.paymentMethod,
          paymentNote: sale.paymentNote,
          formattedDate,
          formattedTime
        },
        customer: sale.customer,
        tenant: {
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          address: tenant.address,
          taxId: tenant.taxId
        },
        items: sale.items.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        user: {
          name: sale.user.name
        },
        whatsapp: {
          message: whatsappMessage,
          phone: sale.customer?.phone,
          encodedMessage: encodeURIComponent(whatsappMessage),
          url: sale.customer?.phone ? `https://wa.me/${sale.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null
        }
      },
      note: 'Use los datos de whatsapp.url para abrir directamente WhatsApp'
    })

  } catch (error) {
    console.error('Error en reenvío de comprobante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}