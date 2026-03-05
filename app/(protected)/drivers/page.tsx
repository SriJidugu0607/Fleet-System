import { prisma } from "@/lib/prisma"
import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { addDriver } from "../../driver-actions"

export default async function Drivers() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const dbuser = await prisma.user.findUnique({
    where: { authId: user.id },
  })

  const drivers = await prisma.driver.findMany({
    where: { companyId: dbuser!.companyId },
  })

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">👨‍✈️ Drivers</h1>

      {/* Add Driver Form */}
      <form action={addDriver} className="mb-6 space-x-2">
        <input
          name="name"
          placeholder="Driver Name"
          required
          className="border px-2 py-1"
        />

        <input
          name="phone"
          placeholder="Phone"
          required
          className="border px-2 py-1"
        />

        <input
          name="licenseNo"
          placeholder="License No"
          className="border px-2 py-1"
        />

        <button className="bg-green-600 text-white px-3 py-1 rounded">
          Add Driver
        </button>
      </form>

      {/* Drivers Table */}
      <table className="w-full bg-white">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>License</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.phone}</td>
              <td>{d.licenseNo}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}