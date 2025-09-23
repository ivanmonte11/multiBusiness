import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  ChartBarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import DashboardChart from "@/app/components/dashboard/DashboardChart"
import Link from 'next/link'

interface MonthlyData {
  ventas: number;
  productos: number;
  costos: number;
  ganancia: number;
}

interface ChartDataItem {
  month: string;
  ventas: number;
  productos: number;
  ganancia: number;
}

export default async function DashboardPage({
  params
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.tenant !== resolvedParams.tenant) {
    redirect("/login")
  }

  // Obtener el tenant con estadísticas
  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolvedParams.tenant },
    include: {
      _count: {
        select: {
          products: true,
          users: true,
          customers: true
        }
      }
    }
  })

  if (!tenant) {
    redirect("/login")
  }

  const [
    lowStockProducts,
    , 
    , 
    totalSales,
    monthlySalesData,
    recentSales
  ] = await Promise.all([
    // Productos con stock bajo
    prisma.product.count({
      where: {
        tenantId: tenant.id,
        quantity: { lt: 10 }
      }
    }),

    // ❌ ELIMINADO: Valor total del inventario (no se usa)
    prisma.product.aggregate({
      where: { tenantId: tenant.id },
      _sum: { 
        cost: true
      }
    }),

    // ❌ ELIMINADO: Productos recientes (no se usa)
    prisma.product.findMany({
      where: { tenantId: tenant.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        cost: true,
        quantity: true,
        category: true,
        createdAt: true
      }
    }),

    // Total de ventas y monto
    prisma.sale.aggregate({
      where: { 
        tenantId: tenant.id,
        status: 'COMPLETED'
      },
      _count: { id: true },
      _sum: { total: true }
    }),

    // Datos mensuales para el gráfico con costos
    prisma.sale.findMany({
      where: {
        tenantId: tenant.id,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                cost: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    }),

    // Ventas recientes
    prisma.sale.findMany({
      where: { 
        tenantId: tenant.id,
        status: 'COMPLETED'
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                cost: true
              }
            }
          }
        }
      }
    })
  ])

  // Calcular ganancia neta total
  const grossRevenue = totalSales._sum.total ? Number(totalSales._sum.total) : 0
  
  const totalCostOfGoodsSold = monthlySalesData.reduce((totalCost, sale) => {
    const saleCost = sale.items.reduce((saleTotal, item) => {
      const itemCost = item.product.cost ? Number(item.product.cost) : 0
      return saleTotal + (itemCost * item.quantity)
    }, 0)
    return totalCost + saleCost
  }, 0)

  const netProfit = grossRevenue - totalCostOfGoodsSold
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

  // Procesar datos para el gráfico con ganancia
  const salesByMonth = monthlySalesData.reduce((acc: { [key: string]: MonthlyData }, sale) => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const month = monthNames[sale.createdAt.getMonth()]
    const year = sale.createdAt.getFullYear()
    const key = `${month}-${year}`
    
    if (!acc[key]) {
      acc[key] = { ventas: 0, productos: 0, costos: 0, ganancia: 0 }
    }
    
    // Calcular costo y ganancia por venta
    const saleCost = sale.items.reduce((total, item) => {
      const itemCost = item.product.cost ? Number(item.product.cost) : 0
      return total + (itemCost * item.quantity)
    }, 0)
    
    acc[key].ventas += Number(sale.total)
    acc[key].productos += sale.items.reduce((sum, item) => sum + item.quantity, 0)
    acc[key].costos += saleCost
    acc[key].ganancia += Number(sale.total) - saleCost
    
    return acc
  }, {})

  const chartData: ChartDataItem[] = Object.entries(salesByMonth)
    .slice(-6)
    .map(([month, data]) => ({
      month,
      ventas: data.ventas,
      productos: data.productos,
      ganancia: data.ganancia
    }))

  // Calcular tendencias
  const lastTwoMonths = chartData.slice(-2)
  const salesTrend = lastTwoMonths.length === 2 
    ? ((lastTwoMonths[1].ventas - lastTwoMonths[0].ventas) / lastTwoMonths[0].ventas) * 100
    : 0


  const totalProducts = tenant._count.products
 
  const totalSalesCount = totalSales._count.id

  const stats = [
    {
      name: 'Ventas totales',
      value: totalSalesCount,
      icon: ShoppingCartIcon,
      change: `${salesTrend >= 0 ? '+' : ''}${salesTrend.toFixed(1)}%`,
      changeType: salesTrend >= 0 ? 'increase' : 'decrease',
      color: 'bg-green-500',
      description: 'Completadas'
    },
    {
      name: 'Ingreso Bruto',
      value: `$${grossRevenue.toLocaleString('es-AR')}`,
      icon: CurrencyDollarIcon,
      change: `${salesTrend >= 0 ? '+' : ''}${salesTrend.toFixed(1)}%`,
      changeType: salesTrend >= 0 ? 'increase' : 'decrease',
      color: 'bg-blue-500',
      description: 'Total de ventas'
    },
    {
      name: 'Ganancia Neta',
      value: `$${netProfit.toLocaleString('es-AR')}`,
      icon: CurrencyDollarIcon,
      change: `${profitMargin.toFixed(1)}% margen`,
      changeType: netProfit >= 0 ? 'increase' : 'decrease',
      color: 'bg-green-500',
      description: 'Después de costos'
    },
    {
      name: 'Productos',
      value: totalProducts,
      icon: CubeIcon,
      change: `${lowStockProducts} bajo stock`,
      changeType: lowStockProducts > 0 ? 'decrease' : 'increase',
      color: 'bg-purple-500',
      description: 'En inventario'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de control de {tenant.name}</p>
      </div>

      {/* Estadísticas MEJORADAS con datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-200 hover:border-opacity-100 hover:border-indigo-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico y Ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico con datos reales */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Rendimiento mensual</h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              salesTrend >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              {salesTrend >= 0 ? '+' : ''}{salesTrend.toFixed(1)}%
            </span>
          </div>
          <DashboardChart data={chartData} />
        </div>

        {/* Ventas recientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ventas recientes</h2>
            <span className="text-sm text-gray-500">{recentSales.length} de {totalSalesCount}</span>
          </div>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => {
                const saleCost = sale.items.reduce((total, item) => {
                  const itemCost = item.product.cost ? Number(item.product.cost) : 0
                  return total + (itemCost * item.quantity)
                }, 0)
                const saleProfit = Number(sale.total) - saleCost

                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        Venta #{sale.saleNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.customer?.name || 'Cliente no especificado'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900">
                        ${Number(sale.total).toLocaleString('es-AR')}
                      </p>
                      <p className={`text-sm ${saleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Ganancia: ${saleProfit.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay ventas registradas</p>
                <p className="text-sm text-gray-400">Realiza tu primera venta para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

 {/* Quick Actions */}
<div className="bg-white rounded-xl shadow-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-6">Acciones rápidas</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Nuevo Producto */}
    <Link 
      href={`/${resolvedParams.tenant}/products`}
      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
    >
      <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
        <CubeIcon className="h-6 w-6 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Nuevo producto</span>
    </Link>

    {/* Registrar Venta */}
    <Link 
      href={`/${resolvedParams.tenant}/sales/new`}
      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
    >
      <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
        <ShoppingCartIcon className="h-6 w-6 text-green-600" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Registrar venta</span>
    </Link>

    {/* Gestionar Clientes */}
    <Link 
      href={`/${resolvedParams.tenant}/customers`}
      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
    >
      <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
        <UsersIcon className="h-6 w-6 text-purple-600" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Gestionar clientes</span>
    </Link>

    {/* Ver Reportes */}
    <Link 
      href={`/${resolvedParams.tenant}/reports`}
      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
    >
      <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
        <ChartBarIcon className="h-6 w-6 text-orange-600" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Ver reportes</span>
    </Link>
  </div>
</div>
    </div>
  )
}