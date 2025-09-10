// src/app/(dashboard)/[tenant]/page.tsx
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
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import DashboardChart from "@/app/components/dashboard/DashboardChart"

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
          users: true
        }
      }
    }
  })

  if (!tenant) {
    redirect("/login")
  }

  // Calcular métricas REALES
  const [
    lowStockProducts,
    totalInventoryValue,
    recentProducts,
    salesData
  ] = await Promise.all([
    // Productos con stock bajo
    prisma.product.count({
      where: {
        tenantId: tenant.id,
        quantity: { lt: 10 } // Menos de 10 unidades
      }
    }),

    // Valor total del inventario
    prisma.product.aggregate({
      where: { tenantId: tenant.id },
      _sum: { 
        price: true
      }
    }),

    // Productos recientes
    prisma.product.findMany({
      where: { tenantId: tenant.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        category: true,
        createdAt: true
      }
    }),

    // Datos para el gráfico (ventas simuladas por ahora)
    Promise.resolve([
      { month: 'Ene', ventas: 4500, productos: 12 },
      { month: 'Feb', ventas: 5200, productos: 15 },
      { month: 'Mar', ventas: 4800, productos: 13 },
      { month: 'Abr', ventas: 6100, productos: 18 },
      { month: 'May', ventas: 7300, productos: 22 },
      { month: 'Jun', ventas: 6800, productos: 20 },
    ])
  ])

  const totalProducts = tenant._count.products
  const totalUsers = tenant._count.users
  const inventoryValue = totalInventoryValue._sum.price || 0

  const stats = [
    {
      name: 'Productos totales',
      value: totalProducts,
      icon: CubeIcon,
      change: '+12%',
      changeType: 'increase',
      color: 'bg-blue-500',
      description: 'En inventario'
    },
    {
      name: 'Usuarios activos',
      value: totalUsers,
      icon: UsersIcon,
      change: '+2',
      changeType: 'increase',
      color: 'bg-green-500',
      description: 'En el sistema'
    },
    {
      name: 'Stock bajo',
      value: lowStockProducts,
      icon: ExclamationTriangleIcon,
      change: `${lowStockProducts > 0 ? '¡Atención!' : 'Estable'}`,
      changeType: lowStockProducts > 0 ? 'decrease' : 'increase',
      color: 'bg-yellow-500',
      description: 'Por reabastecer'
    },
    {
      name: 'Valor inventario',
      value: `$${Number(inventoryValue).toLocaleString('es-AR')}`,
      icon: ChartBarIcon,
      change: '+8.2%',
      changeType: 'increase',
      color: 'bg-purple-500',
      description: 'Valor total'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de control de {tenant.name}</p>
      </div>

      {/* Estadísticas MEJORADAS */}
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

      {/* Gráfico y Productos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico interactivo */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Rendimiento mensual</h2>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12.3%
            </span>
          </div>
          <DashboardChart data={salesData} />
        </div>

        {/* Productos recientes MEJORADO */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos recientes</h2>
            <span className="text-sm text-gray-500">{recentProducts.length} de {totalProducts}</span>
          </div>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">
                      ${Number(product.price).toLocaleString('es-AR')}
                    </p>
                    <p className={`text-sm ${
                      product.quantity < 5 ? 'text-red-600' : 
                      product.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.quantity} unidades
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay productos registrados</p>
                <p className="text-sm text-gray-400">Agrega tu primer producto para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions MEJORADO */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group">
            <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Nuevo producto</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group">
            <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
              <ShoppingCartIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Registrar venta</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
            <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Gestionar usuarios</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group">
            <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Ver reportes</span>
          </button>
        </div>
      </div>
    </div>
  )
}