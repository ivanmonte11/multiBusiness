import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardChart from "@/app/components/dashboard/DashboardChart"
import Link from 'next/link'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle2,
  Plus,
  FileText
} from 'lucide-react'

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

  // Obtener el tenant con estadísticas Y datos de subscription
  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolvedParams.tenant },
    include: {
      _count: {
        select: {
          products: true,
          users: true,
          customers: true
        }
      },
      subscription: true
    }
  })

  if (!tenant) {
    redirect("/login")
  }

  //  CORRECCIÓN: Lógica mejorada para detectar trial
  const now = new Date();
  const trialEndsAt = tenant.subscription?.currentPeriodEnd;
  const isInTrialPeriod = trialEndsAt && new Date(trialEndsAt) > now;
  const daysLeft = trialEndsAt 
    ? Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const shouldShowTrialAlert = isInTrialPeriod && daysLeft > 0;

  // Debug: Ver qué datos tenemos
  console.log('🔍 Debug Trial Info:', {
    tenantId: tenant.id,
    subscription: tenant.subscription,
    trialEndsAt: trialEndsAt,
    now: now,
    isInTrialPeriod: isInTrialPeriod,
    daysLeft: daysLeft,
    shouldShowTrialAlert: shouldShowTrialAlert
  });

  const [
    lowStockProducts,
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

  return (
    <div className="space-y-6">
      {/*  ALERTA DE TRIAL */}
      {shouldShowTrialAlert && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  <strong>Prueba Gratuita Activa</strong> - Tienes <span className="font-bold text-blue-900">{daysLeft} días</span> restantes
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Prueba todas las funciones premium antes de elegir tu plan definitivo
                </p>
              </div>
            </div>
            <Link 
              href={`/${resolvedParams.tenant}/billing`}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Elegir Plan
            </Link>
          </div>
        </div>
      )}

      {/* Header con info del plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido al panel de control de {tenant.name}</p>
            
            {/* Info del plan */}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Estado: <span className="capitalize font-medium text-gray-700">
                  {shouldShowTrialAlert ? 'Prueba gratuita' : (tenant.subscription?.status?.toLowerCase() || 'activo')}
                </span>
              </span>
              {shouldShowTrialAlert && (
                <span>
                  • Expira: <span className="font-medium text-gray-700">
                    {new Date(trialEndsAt!).toLocaleDateString('es-AR')}
                  </span>
                </span>
              )}
              {tenant.subscription?.plan && (
                <span>
                  • Plan: <span className="font-medium text-gray-700 capitalize">
                    {tenant.subscription.plan.toLowerCase()}
                  </span>
                </span>
              )}
            </div>
          </div>
          
          {/* Badge de estado */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            shouldShowTrialAlert 
              ? 'bg-blue-100 text-blue-800' 
              : tenant.subscription?.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {shouldShowTrialAlert ? 'Prueba Gratuita' : (tenant.subscription?.status?.toLowerCase() || 'activo')}
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas totales */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-200 hover:border-opacity-100 hover:border-indigo-400">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Ventas totales</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{totalSalesCount}</p>
              <p className="text-xs text-gray-500">Completadas</p>
              <div className={`flex items-center mt-2 text-sm ${
                salesTrend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {salesTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {salesTrend >= 0 ? '+' : ''}{salesTrend.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <ShoppingCart className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Ingreso Bruto */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-200 hover:border-opacity-100 hover:border-indigo-400">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Ingreso Bruto</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">${grossRevenue.toLocaleString('es-AR')}</p>
              <p className="text-xs text-gray-500">Total de ventas</p>
              <div className={`flex items-center mt-2 text-sm ${
                salesTrend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {salesTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {salesTrend >= 0 ? '+' : ''}{salesTrend.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-200 hover:border-opacity-100 hover:border-indigo-400">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Ganancia Neta</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">${netProfit.toLocaleString('es-AR')}</p>
              <p className="text-xs text-gray-500">Después de costos</p>
              <div className={`flex items-center mt-2 text-sm ${
                netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {profitMargin.toFixed(1)}% margen
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-200 hover:border-opacity-100 hover:border-indigo-400">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Productos</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{totalProducts}</p>
              <p className="text-xs text-gray-500">En inventario</p>
              <div className={`flex items-center mt-2 text-sm ${
                lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {lowStockProducts > 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-1" />
                )}
                {lowStockProducts} bajo stock
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y Ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico con datos reales */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Rendimiento mensual
            </h2>
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
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ventas recientes
            </h2>
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
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay ventas registradas</p>
                <p className="text-sm text-gray-400">Realiza tu primera venta para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href={`/${resolvedParams.tenant}/products`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Productos</span>
          </Link>

          <Link 
            href={`/${resolvedParams.tenant}/sales/new`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Nueva Venta</span>
          </Link>

          <Link 
            href={`/${resolvedParams.tenant}/customers`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Clientes</span>
          </Link>

          <Link 
            href={`/${resolvedParams.tenant}/billing`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Facturación</span>
          </Link>
        </div>
      </div>
    </div>
  )
}