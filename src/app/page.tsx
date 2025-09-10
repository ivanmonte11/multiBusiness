// src/app/page.tsx
import Link from "next/link"
import Navbar from "@/app/components/layout/Navbar"
import { 
  RocketLaunchIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingCartIcon,
  CubeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CloudIcon
} from "@heroicons/react/24/outline"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sistema Multirubro
              <span className="block text-indigo-200">Multitenant</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              La plataforma todo en uno para gestionar múltiples negocios desde un solo lugar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                Comenzar Ahora
              </Link>
              <Link
                href="#features"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Ver Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Potencia tu negocio
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Diseñado para emprendedores que manejan múltiples rubros y necesitan una solución unificada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple, seguro y escalable para cualquier tipo de negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Únete a cientos de emprendedores que ya están usando nuestro sistema multirubro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 Sistema Multirubro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: CubeIcon,
    title: "Gestión Multi-rubro",
    description: "Administra diferentes tipos de negocios desde una sola plataforma con configuraciones específicas para cada rubro."
  },
  {
    icon: UsersIcon,
    title: "Multi-usuario",
    description: "Acceso simultáneo para tu equipo con permisos granularizados y roles personalizables."
  },
  {
    icon: ChartBarIcon,
    title: "Reportes en Tiempo Real",
    description: "Dashboard interactivo con métricas clave y análisis de rendimiento para cada negocio."
  },
  {
    icon: ShoppingCartIcon,
    title: "Control de Inventario",
    description: "Gestión avanzada de stock con alertas automáticas y seguimiento de movimientos."
  },
  {
    icon: ShieldCheckIcon,
    title: "Seguridad Enterprise",
    description: "Datos encriptados y backups automáticos para garantizar la seguridad de tu información."
  },
  {
    icon: CloudIcon,
    title: "Acceso desde Cualquier Lugar",
    description: "Plataforma 100% web responsive que funciona en cualquier dispositivo con internet."
  }
]

const steps = [
  {
    title: "Crea tu Cuenta",
    description: "Regístrate en minutos y configura tu perfil de negocio principal."
  },
  {
    title: "Configura tus Rubros",
    description: "Define los diferentes tipos de negocios que manejas y sus particularidades."
  },
  {
    title: "Comienza a Gestionar",
    description: "Importa tus datos, invita a tu equipo y comienza a optimizar tus operaciones."
  }
]