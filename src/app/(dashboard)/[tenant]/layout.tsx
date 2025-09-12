import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/app/components/dashboard/SideBar"
import Header from "@/app/components/dashboard/Header"

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.tenant !== resolvedParams.tenant) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar tenant={resolvedParams.tenant} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}