import Link from "next/link"
import Navbar from "@/app/components/layout/Navbar"
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  ShieldCheckIcon,
  CloudIcon,
  CheckIcon,
  StarIcon
} from "@heroicons/react/24/outline"

interface StringPlans {
  basic: string;
  professional: string;
  enterprise: string;
}

interface BooleanPlans {
  basic: boolean;
  professional: boolean;
  enterprise: boolean;
}

type PlanFeature = StringPlans | BooleanPlans;

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
              PrenderPOS
              <span className="block text-indigo-200">Sistema en la Nube</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              La plataforma SaaS todo en uno para gestionar múltiples negocios desde un solo lugar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                Comenzar Prueba Gratis
              </Link>
              <Link
                href="#pricing"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Ver Planes y Precios
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
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Planes Transparentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Elige el plan que mejor se adapte a tu negocio. Sin sorpresas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${plan.recommended
                ? 'ring-2 ring-indigo-500 transform scale-105 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${plan.price.toLocaleString('es-AR')}</span>
                    <span className="text-gray-500 dark:text-gray-400">/mes</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.recommended ? "/register" : "/login"}
                    className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${plan.recommended
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {plan.recommended ? 'Comenzar Prueba' : 'Saber Más'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-300">
              💳 Todos los planes incluyen 14 días de prueba gratis • Cancelación en cualquier momento
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Comparación de Planes
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-6 font-semibold text-foreground">Características</th>
                  {pricingPlans.map(plan => (
                    <th key={plan.id} className="text-center p-6 font-semibold text-foreground">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => {
                  //  CORREGIDO: Usar type assertion segura en lugar de any
                  const plans = feature.plans as Record<string, string | boolean>;

                  return (
                    <tr key={feature.name} className="even:bg-gray-50 dark:even:bg-gray-800">
                      <td className="p-6 font-medium text-foreground">{feature.name}</td>
                      {pricingPlans.map(plan => (
                        <td key={plan.id} className="text-center p-6">
                          {typeof plans[plan.id] === 'boolean' ? (
                            plans[plan.id] ? (
                              <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="font-medium text-foreground">{plans[plan.id] as string}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
            {steps.map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {steps.indexOf(step) + 1}
                  </span>
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
            Únete a cientos de emprendedores que ya están usando PrenderPOS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Probar 14 Días Gratis
            </Link>
            <Link
              href="#pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Comparar Planes
            </Link>
          </div>
        </div>
      </section>

     {/* Footer */}
<footer className="bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Main Footer Content */}
    <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Company Info */}
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PrenderPOS
          </span>
        </div>
        <p className="text-gray-300 mb-4 max-w-md">
          Solución integral de punto de venta diseñada para impulsar el crecimiento 
          de tu empresa con tecnología de vanguardia.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <span className="sr-only">Facebook</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <span className="sr-only">LinkedIn</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <span className="sr-only">Twitter</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Product Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Producto
        </h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Características</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Planes y Precios</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">App Móvil</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
        </ul>
      </div>

      {/* Support Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Soporte
        </h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centro de Ayuda</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentación</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-gray-800 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
          <a href="#" className="hover:text-white transition-colors">Seguridad</a>
        </div>
        
        <div className="text-sm text-gray-400">
          <p>&copy; 2024 PrenderPOS. Todos los derechos reservados.</p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>🌎 Español</span>
        </div>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}

const pricingPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 14999,
    description: 'Perfecto para pequeños emprendimientos',
    recommended: false,
    features: [
      '2,500 ventas/mes',
      '3 usuarios incluidos',
      'Hasta 2 rubros diferentes',
      'Soporte prioritario',
      'App móvil incluida',
      'Backups automáticos'
    ]
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: 29999,
    description: 'Ideal para negocios en crecimiento',
    recommended: true,
    features: [
      '10,000 ventas/mes',
      '10 usuarios incluidos',
      'Hasta 5 rubros diferentes',
      'Soporte 24/7',
      'Reportes avanzados',
      'API acceso',
      'Integraciones premium'
    ]
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 59999,
    description: 'Para grandes empresas y cadenas',
    recommended: false,
    features: [
      'Ventas ilimitadas',
      'Usuarios ilimitados',
      'Rubros ilimitados',
      'Soporte dedicado',
      'Personalización avanzada',
      'Migración asistida',
      'Entrenamiento personalizado'
    ]
  }
]

const comparisonFeatures = [
  {
    name: 'Ventas mensuales incluidas',
    plans: {
      basic: '2,500',
      professional: '10,000',
      enterprise: 'Ilimitadas'
    }
  },
  {
    name: 'Usuarios incluidos',
    plans: {
      basic: '3',
      professional: '10',
      enterprise: 'Ilimitados'
    }
  },
  {
    name: 'Rubros diferentes',
    plans: {
      basic: '2',
      professional: '5',
      enterprise: 'Ilimitados'
    }
  },
  {
    name: 'Soporte prioritario',
    plans: {
      basic: true,
      professional: true,
      enterprise: true
    }
  },
  {
    name: 'Soporte 24/7',
    plans: {
      basic: false,
      professional: true,
      enterprise: true
    }
  },
  {
    name: 'App móvil',
    plans: {
      basic: true,
      professional: true,
      enterprise: true
    }
  },
  {
    name: 'Reportes avanzados',
    plans: {
      basic: false,
      professional: true,
      enterprise: true
    }
  },
  {
    name: 'API acceso',
    plans: {
      basic: false,
      professional: true,
      enterprise: true
    }
  },
  {
    name: 'Soporte dedicado',
    plans: {
      basic: false,
      professional: false,
      enterprise: true
    }
  }
]

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
    description: "Regístrate en minutos y comienza tu prueba gratis de 14 días."
  },
  {
    title: "Configura tus Negocios",
    description: "Define los diferentes rubros y personaliza cada uno según tus necesidades."
  },
  {
    title: "Elige tu Plan",
    description: "Selecciona el plan que mejor se adapte a tu volumen de negocio."
  }
]