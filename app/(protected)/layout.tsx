import Link from "next/link"
import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase-server"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">🚛 Fleet</h2>

        <nav className="space-y-3">
          <Link href="/dashboard" className="block hover:text-blue-400">
            Dashboard
          </Link>
          <Link href="/vehicles" className="block hover:text-blue-400">
            Vehicles
          </Link>
          <Link href="/drivers" className="block hover:text-blue-400">
            Drivers
          </Link>
          <Link href="/trips" className="block hover:text-blue-400">
            Trips
          </Link>
          <Link href="/maintenance" className="block hover:text-blue-400">
            Maintenance
          </Link>
          <Link href="/settlements" className="block hover:text-blue-400">
            Settlements
          </Link>

          <Link href="/transports" className="block hover:text-blue-400">
            Transports
          </Link>

          <Link href="/reports" className="block hover:text-blue-400">
            Reports
          </Link>
          

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>

    </div>
  )
}