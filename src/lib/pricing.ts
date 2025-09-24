export const ARGENTINA_PRICING = {
  BASIC: {
    id: 'basic',
    price: 14999,
    title: 'Plan Básico',
    salesLimit: 2500,
    users: 3,
    features: [
      '2,500 ventas/mes',
      '3 usuarios', 
      'Soporte prioritario',
      'App móvil'
    ],
    recommended: false 
  },
  PROFESSIONAL: {
    id: 'professional', 
    price: 29999,
    title: 'Plan Professional',
    salesLimit: 10000,
    users: 10,
    features: [
      '10,000 ventas/mes',
      '10 usuarios',
      'Soporte 24/7',
      'Analytics avanzado'
    ],
    recommended: true
  },
  ENTERPRISE: {
    id: 'enterprise',
    price: 59999,
    title: 'Plan Enterprise', 
    salesLimit: -1,
    users: -1,
    features: [
      'Ventas ilimitadas',
      'Usuarios ilimitados',
      'Soporte dedicado',
      'Personalización'
    ],
    recommended: false 
  }
}