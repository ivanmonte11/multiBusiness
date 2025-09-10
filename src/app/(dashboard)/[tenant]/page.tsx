export default async function DashboardPage({
  params
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Bienvenido al panel de control de {resolvedParams.tenant}.</p>
    </div>
  )
}